import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/Auth";
import { getContractBillingMetrics } from "../utils/contractCalculations";

const API = import.meta.env.VITE_APP_BACKEND;

export function useContracts() {
  const [auth] = useAuth();
  const [contracts, setContracts] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [subFilter, setSubFilter] = useState("All");
  const [sortBy, setSortBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/v1/contracts/getcontracts`);
      const list = response.data.contracts || [];
      list.sort((a, b) =>
        parseInt(String(b.fileno || "").replace(/\D/g, "") || "0", 10) -
        parseInt(String(a.fileno || "").replace(/\D/g, "") || "0", 10)
      );
      setContracts(list);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/api/v1/bills/getbills`);
      setBills(response.data.bills || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load bills");
    }
  }, []);

  const refreshContracts = useCallback(() => {
    fetchContracts();
    fetchBills();
  }, [fetchContracts, fetchBills]);

  useEffect(() => {
    if (!auth?.user) return;
    fetchBills();
  }, [auth?.user, fetchBills]);

  useEffect(() => {
    if (!auth?.user) return;
    const timer = setTimeout(async () => {
      if (!searchTerm.trim()) {
        fetchContracts();
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `${API}/api/v1/contracts/search/${encodeURIComponent(searchTerm.trim())}`
        );
        setContracts(Array.isArray(response.data) ? response.data : response.data.contracts || []);
      } catch (error) {
        console.error("Error searching contracts:", error);
        toast.error("Contract search failed");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, auth?.user, fetchContracts]);

  const matchedBills = useMemo(() => {
    const fileNos = new Set(contracts.map(contract => contract.fileno).filter(Boolean));
    return bills.filter(bill => fileNos.has(bill.fileno));
  }, [bills, contracts]);

  const uniqueDivisions = useMemo(() =>
    [...new Set(contracts.map(contract => contract.division).filter(Boolean))].sort(),
  [contracts]);

  const filteredContracts = useMemo(() => contracts.filter(contract => {
    if (statusFilter !== "All" && contract.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (subFilter === "sub" && contract.owner?.toLowerCase() !== "sub") return false;
    if (subFilter === "removeSub" && contract.owner?.toLowerCase() === "sub") return false;
    if (divisionFilter !== "All" && contract.division !== divisionFilter) return false;

    const query = searchTerm.toLowerCase();
    return [contract.fileno, contract.division, contract.workname, contract.contractNumber]
      .some(value => String(value || "").toLowerCase().includes(query));
  }), [contracts, statusFilter, subFilter, divisionFilter, searchTerm]);

  const sortedContracts = useMemo(() => [...filteredContracts].sort((a, b) => {
    if (sortBy === "date-desc") return new Date(b.startdate || 0) - new Date(a.startdate || 0);
    if (sortBy === "date-asc") return new Date(a.startdate || 0) - new Date(b.startdate || 0);
    if (sortBy === "value-desc") return Number(b.contractvalue || 0) - Number(a.contractvalue || 0);
    if (sortBy === "value-asc") return Number(a.contractvalue || 0) - Number(b.contractvalue || 0);
    return 0;
  }), [filteredContracts, sortBy]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sortedContracts.length / itemsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [sortedContracts.length, currentPage]);

  const currentDisplayedContracts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedContracts.slice(start, start + itemsPerPage);
  }, [sortedContracts, currentPage]);

  const aggregateMetrics = useMemo(() => sortedContracts.reduce((acc, contract) => {
    const relatedBills = matchedBills.filter(bill => bill.fileno === contract.fileno);
    const metrics = getContractBillingMetrics(contract, relatedBills);
    acc.totalBilled += metrics.actualBilledAmount;
    acc.totalBillableToDate += metrics.currentBillableValue;
    acc.totalBalanceToBill += metrics.balanceToBill;
    return acc;
  }, { totalBilled: 0, totalBillableToDate: 0, totalBalanceToBill: 0 }), [sortedContracts, matchedBills]);

  const contractNotifications = useMemo(() => sortedContracts
    .filter(contract => contract.status === "Active")
    .map(contract => {
      const relatedBills = matchedBills.filter(bill => bill.fileno === contract.fileno);
      return {
        fileno: contract.fileno,
        contractNumber: contract.contractNumber,
        percentage: getContractBillingMetrics(contract, relatedBills).billableToDatePercentage
      };
    })
    .filter(item => item.percentage >= 100), [sortedContracts, matchedBills]);

  return {
    loading, contracts, bills, searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    divisionFilter, setDivisionFilter, subFilter, setSubFilter, sortBy, setSortBy,
    currentPage, setCurrentPage, sortedContracts, currentDisplayedContracts,
    totalPages: Math.ceil(sortedContracts.length / itemsPerPage), uniqueDivisions,
    matchedBills, contractNotifications, aggregateMetrics, refreshContracts
  };
}
