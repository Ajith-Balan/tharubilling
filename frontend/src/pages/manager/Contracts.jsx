import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaClipboardCheck,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaBuilding,
  FaFolderOpen,
  FaBell,
  FaFileExcel,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/layout/BackButton";

// Helper: Parse zero-time local date to prevent timezone shift issues
const parseZeroTimeDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// 1. Date-Wise Progress (Time Elapsed)
const getDateCompletionPercentage = (contract) => {
  if (!contract || !contract.startdate || !contract.enddate) return 0;

  const startDay = parseZeroTimeDate(contract.startdate);
  const origEndDay = parseZeroTimeDate(contract.enddate);
  if (!startDay || !origEndDay) return 0;

  const today = new Date();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (todayDay < startDay) return 0;

  const hasExtension = contract.extension && !isNaN(new Date(contract.extension).getTime());
  const extEndDay = hasExtension ? parseZeroTimeDate(contract.extension) : null;
  const effectiveEndDay = extEndDay || origEndDay;

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const originalDurationDays = Math.max(1, Math.floor((origEndDay - startDay) / MS_PER_DAY));

  if (todayDay >= effectiveEndDay) {
    if (!extEndDay) return 100;
    const totalExtendedDays = Math.max(1, Math.floor((extEndDay - startDay) / MS_PER_DAY));
    return Math.max(100, Math.round((totalExtendedDays / originalDurationDays) * 100));
  }

  const elapsedDays = Math.floor((todayDay - startDay) / MS_PER_DAY);
  const activeDurationDays = Math.max(1, Math.floor((effectiveEndDay - startDay) / MS_PER_DAY));

  return Math.max(0, Math.round((elapsedDays / activeDurationDays) * 100));
};

// 2. Billing Metrics (Finds billto, calculates daily rate, and Billable To Date)
const getContractBillingMetrics = (contract, contractBills = []) => {
  if (!contract || !contract.startdate || !contract.enddate) {
    return {
      lastBillToDate: null,
      actualBilledAmount: 0,
      currentBillableValue: 0,
      balanceToBill: 0,
      requiredDailyRate: 0,
      billableToDatePercentage: 0,
      isExpired: false,
    };
  }

  const startDay = parseZeroTimeDate(contract.startdate);
  const origEndDay = parseZeroTimeDate(contract.enddate);
  const extEndDay = parseZeroTimeDate(contract.extension);
  const effectiveEndDay = extEndDay || origEndDay;

  const today = new Date();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isExpired = effectiveEndDay ? todayDay >= effectiveEndDay : false;

  const totalContractValue =
    Number(contract.contractvalue || 0);

  const actualBilledAmount = contractBills.reduce(
    (sum, bill) => sum + (Number(bill.totalamount) || 0),
    0
  );

  // Extract latest bill date prioritizing `billto`
  let lastBillToDate = null;
  contractBills.forEach((bill) => {
    const rawDate =
      bill.billto || bill.billpassdt || bill.billdate || bill.date || bill.createdAt;
    const parsedDate = parseZeroTimeDate(rawDate);
    if (parsedDate && (!lastBillToDate || parsedDate > lastBillToDate)) {
      lastBillToDate = parsedDate;
    }
  });

  let currentBillableValue = actualBilledAmount;
  let requiredDailyRate = 0;

  if (startDay && effectiveEndDay && totalContractValue > 0) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const totalContractDays =
      Math.max(1, Math.floor((effectiveEndDay - startDay) / MS_PER_DAY)) + 1;

    requiredDailyRate = totalContractValue / totalContractDays;

    if (!isExpired) {
      const calculationEndDay = todayDay < effectiveEndDay ? todayDay : effectiveEndDay;
      const unbilledStartDay = lastBillToDate
        ? new Date(
            lastBillToDate.getFullYear(),
            lastBillToDate.getMonth(),
            lastBillToDate.getDate() + 1
          )
        : startDay;

      let unbilledDays = 0;
      if (unbilledStartDay <= calculationEndDay) {
        unbilledDays =
          Math.floor((calculationEndDay - unbilledStartDay) / MS_PER_DAY) + 1;
      }

      currentBillableValue = actualBilledAmount + unbilledDays * requiredDailyRate;
    }
  }

  const balanceToBill = Math.max(0, totalContractValue + Number(contract.extendedvalue || 0) - currentBillableValue);

  // Billable To Date % = (Billable To Date / Total Contract Value) * 100
  const billableToDatePercentage =
    totalContractValue > 0
      ? Math.round((currentBillableValue / totalContractValue) * 100)
      : 0;

  return {
    lastBillToDate,
    actualBilledAmount,
    currentBillableValue,
    balanceToBill,
    requiredDailyRate,
    billableToDatePercentage,
    isExpired,
  };
};

const Contracts = () => {
  const [auth] = useAuth();
  const [contracts, setContracts] = useState([]);
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  // Search, Filter, & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [subFilter, setSubFilter] = useState("All");
  const [sortBy, setSortBy] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = parseZeroTimeDate(date);
    if (!d) return "N/A";
    return d.toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/getcontracts`
      );
      const sortedContracts = (res.data.contracts || []).sort(
        (a, b) =>
          parseInt(b.fileno?.replace(/\D/g, "") || "0", 10) -
          parseInt(a.fileno?.replace(/\D/g, "") || "0", 10)
      );
      setContracts(sortedContracts);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/getbills`
      );
      setBills(res.data.bills || []);
    } catch (err) {
      console.error("Error fetching bills:", err);
      toast.error("Failed to load bills");
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() !== "") {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/search/${searchTerm}`
          );
          setContracts(res.data || []);
          setCurrentPage(1);
        } catch (err) {
          console.error("Error hitting search endpoint:", err);
        }
      } else if (auth?.user) {
        fetchContracts();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, auth?.user]);

  useEffect(() => {
    if (auth?.user) {
      fetchBills();
    }
  }, [auth?.user]);

  const contractPeriods = contracts.map((c) => c.fileno).filter(Boolean);
  const matchedBills = bills.filter((bill) =>
    contractPeriods.includes(bill.fileno)
  );

  const contractNotifications = contracts
    .filter((contract) => contract.status === "Active")
    .map((contract) => {
      const contractBills = matchedBills.filter(
        (bill) => bill.fileno === contract.fileno
      );
      const metrics = getContractBillingMetrics(contract, contractBills);
      return {
        fileno: contract.fileno,
        contractNumber: contract.contractNumber,
        percentage: metrics.billableToDatePercentage,
      };
    })
    .filter((item) => item.percentage >= 100);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uniqueDivisions = Array.from(
    new Set(contracts.map((c) => c.division).filter(Boolean))
  ).sort();

  // Filter Logic
  const filteredContracts = contracts.filter((contract) => {
    if (
      statusFilter !== "All" &&
      contract.status?.toLowerCase() !== statusFilter.toLowerCase()
    ) {
      return false;
    }

    if (subFilter === "sub" && contract.owner?.toLowerCase() !== "sub") {
      return false;
    }

    if (subFilter === "removeSub" && contract.owner?.toLowerCase() === "sub") {
      return false;
    }

    if (divisionFilter !== "All" && contract.division !== divisionFilter) {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      (contract.fileno?.toLowerCase() || "").includes(searchLower) ||
      (contract.division?.toLowerCase() || "").includes(searchLower) ||
      (contract.workname?.toLowerCase() || "").includes(searchLower) ||
      (contract.contractNumber?.toLowerCase() || "").includes(searchLower)
    );
  });

  // Sort Logic
  const sortedContracts = [...filteredContracts].sort((a, b) => {
    if (sortBy === "date-desc")
      return new Date(b.startdate || 0) - new Date(a.startdate || 0);
    if (sortBy === "date-asc")
      return new Date(a.startdate || 0) - new Date(b.startdate || 0);
    if (sortBy === "value-desc")
      return (Number(b.contractvalue) || 0) - (Number(a.contractvalue) || 0);
    if (sortBy === "value-asc")
      return (Number(a.contractvalue) || 0) - (Number(b.contractvalue) || 0);
    return 0;
  });

  // Dynamic Dashboard Metrics Aggregate (Calculated on sortedContracts to respond to active filters)
  const aggregateMetrics = sortedContracts.reduce(
    (acc, contract) => {
      const contractBills = matchedBills.filter(
        (bill) => bill.fileno === contract.fileno
      );

      const metrics = getContractBillingMetrics(contract, contractBills);

      acc.totalBilled += metrics.actualBilledAmount;
      acc.totalBillableToDate += metrics.currentBillableValue;
      acc.totalBalanceToBill += metrics.balanceToBill;

      return acc;
    },
    { totalBilled: 0, totalBillableToDate: 0, totalBalanceToBill: 0 }
  );

  // Pagination Engine
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedContracts = sortedContracts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedContracts.length / itemsPerPage);

  const statusClasses = {
    Active: "bg-white text-green-900",
    Completed: "bg-blue-300 text-blue-900",
    Closed: "bg-red-300 text-red-900",
    Pending: "bg-yellow-300 text-yellow-900",
  };

  const statusBadge = {
    Active: "bg-green-100 text-green-800 border-green-300",
    Completed: "bg-blue-100 text-blue-800 border-blue-300",
    Closed: "bg-red-100 text-red-800 border-red-300",
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  // Export to Excel
  const exportToExcel = () => {
    if (sortedContracts.length === 0) {
      toast.warn("No data available to export");
      return;
    }

    const exportData = sortedContracts.map((c) => {
      const contractBills = matchedBills.filter((b) => b.fileno === c.fileno);
      const totalPenalty = contractBills.reduce(
        (sum, b) => sum + (Number(b.penalty) || 0),
        0
      );
      const metrics = getContractBillingMetrics(c, contractBills);

      return {
        "File No": c.fileno || "N/A",
        Railway: c.railway,
        Division: c.division || "N/A",
        "Name of Work": c.workname || "N/A",
        "Train Name": c.trainname,
        "Contract Number": c.contractNumber || "N/A",
        Date: c.date,
        "Start Date": formatDate(c.startdate),
        "End Date": formatDate(c.enddate),
        "Extended Date": c.extension ? formatDate(c.extension) : "N/A",
        "Last Bill To Date": metrics.lastBillToDate ? formatDate(metrics.lastBillToDate) : "N/A",
        "Contract Value (₹)": Number(c.contractvalue || 0),
        "Billable To Date (₹)": Math.round(metrics.currentBillableValue),
        "Billable %": `${metrics.billableToDatePercentage}%`,
        "Total Penalty (₹)": totalPenalty,
        Status: c.status || "N/A",
        Manager: c.managername || "N/A",
        Owner: c.owner || "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contracts");
    XLSX.writeFile(workbook, "Contracts_Data.xlsx");
    toast.success("Excel sheet downloaded successfully!");
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="bg-white rounded-xl shadow p-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-200 rounded mb-3"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Contract & Bill Management - Manager">
      <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <BackButton />

          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Contract Dashboard
            </h1>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow transition duration-200 text-sm"
            >
              <FaFileExcel className="text-lg" />
              <span>Export Excel ({sortedContracts.length})</span>
            </button>
          </div>

          {/* Cards (Reflect Filtered/Sorted Data) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-4 sm:p-5 text-white shadow-lg hover:scale-105 transition duration-300">
              <div className="absolute -right-5 -top-5 opacity-20">
                <FaFolderOpen size={80} />
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-90">Total Contracts</p>
              <h2 className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{sortedContracts.length}</h2>
              <p className="text-[10px] sm:text-xs mt-2 sm:mt-3 opacity-80">Filtered results</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-5 text-white shadow-lg hover:scale-105 transition duration-300">
              <div className="absolute -right-5 -top-5 opacity-20">
                <FaCheckCircle size={80} />
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-90">Active</p>
              <h2 className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">
                {sortedContracts.filter((c) => c.status === "Active").length}
              </h2>
              <p className="text-[10px] sm:text-xs mt-2 sm:mt-3 opacity-80">Currently running</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 p-4 sm:p-5 text-white shadow-lg hover:scale-105 transition duration-300">
              <div className="absolute -right-5 -top-5 opacity-20">
                <FaClipboardCheck size={80} />
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-90">Completed</p>
              <h2 className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">
                {sortedContracts.filter((c) => c.status === "Completed").length}
              </h2>
              <p className="text-[10px] sm:text-xs mt-2 sm:mt-3 opacity-80">Finished</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 p-4 sm:p-5 text-white shadow-lg hover:scale-105 transition duration-300">
              <div className="absolute -right-5 -top-5 opacity-20">
                <FaTimesCircle size={80} />
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-90">Closed</p>
              <h2 className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">
                {sortedContracts.filter((c) => c.status === "Closed").length}
              </h2>
              <p className="text-[10px] sm:text-xs mt-2 sm:mt-3 opacity-80">Inactive</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 text-white shadow-lg">
              <p className="text-xs sm:text-sm font-medium opacity-90">Total Billed</p>
              <h2 className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2">
                ₹{Math.round(aggregateMetrics.totalBilled).toLocaleString("en-IN")}
              </h2>
              <p className="text-[10px] sm:text-xs mt-2 opacity-80">Actual Billed Amount</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-5 text-white shadow-lg">
              <p className="text-xs sm:text-sm font-medium opacity-90">Billable To-Date</p>
              <h2 className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2">
                ₹{Math.round(aggregateMetrics.totalBillableToDate).toLocaleString("en-IN")}
              </h2>
              <p className="text-[10px] sm:text-xs mt-2 opacity-80">
                Billed + Projected to Today
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 sm:p-5 text-white shadow-lg">
              <p className="text-xs sm:text-sm font-medium opacity-90">Balance To Be Billed</p>
              <h2 className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2">
                ₹{Math.round(aggregateMetrics.totalBalanceToBill).toLocaleString("en-IN")}
              </h2>
              <p className="text-[10px] sm:text-xs mt-2 opacity-80">Remaining Contract Value</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 sm:p-5 text-white shadow-lg">
              <p className="text-xs sm:text-sm font-medium opacity-90">Unbilled Amount</p>
              <h2 className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2">
                ₹{Math.round(aggregateMetrics.totalBillableToDate - aggregateMetrics.totalBilled).toLocaleString("en-IN")}
              </h2>
              <p className="text-[10px] sm:text-xs mt-2 opacity-80">Till Now</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="flex justify-end mb-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-md border hover:bg-gray-100 transition"
              >
                <FaBell className="text-lg sm:text-xl text-gray-700" />
                {contractNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {contractNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 bg-blue-600 text-white">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold">
                      {contractNotifications.length}
                    </span>
                  </div>
                  {contractNotifications.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">
                      🎉 No notifications
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {contractNotifications.map((item) => (
                        <div
                          key={item.fileno}
                          className="flex items-start gap-3 px-5 py-4 border-b last:border-b-0 hover:bg-gray-50 transition"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            🔔
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-purple-700">
                              {item.fileno}{" "}
                              {item.contractNumber && `- ${item.contractNumber}`}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Billable amount reached{" "}
                              <span className="font-bold text-red-600">
                                {item.percentage}%
                              </span>
                              .
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-5 py-3 bg-gray-50 text-center text-xs text-gray-500">
                    Total Notifications: {contractNotifications.length}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contracts..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-sm px-3 py-2">
              <FaBuilding className="text-slate-500 mr-2 text-sm" />
              <select
                value={divisionFilter}
                onChange={(e) => {
                  setDivisionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer text-sm w-full"
              >
                <option value="All">All Divisions</option>
                {uniqueDivisions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-sm px-3 py-2">
              <FaFilter className="text-slate-500 mr-2 text-sm" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer text-sm w-full"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-sm px-3 py-2">
              <FaSortAmountDown className="text-slate-500 mr-2 text-sm" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer text-sm w-full"
              > 
                <option value="">Select</option>
                <option value="date-desc">Newest Contract First</option>
                <option value="date-asc">Oldest Contract First</option>
                <option value="value-desc">Value: High to Low</option>
                <option value="value-asc">Value: Low to High</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white cursor-pointer">
              <input
                type="radio"
                name="subFilter"
                checked={subFilter === "All"}
                onChange={() => {
                  setSubFilter("All");
                  setCurrentPage(1);
                }}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-xs font-medium text-slate-600">All</span>
            </label>

            <label className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white cursor-pointer">
              <input
                type="radio"
                name="subFilter"
                checked={subFilter === "sub"}
                onChange={() => {
                  setSubFilter("sub");
                  setCurrentPage(1);
                }}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-xs font-medium text-slate-600">Only Sub</span>
            </label>

            <label className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white cursor-pointer">
              <input
                type="radio"
                name="subFilter"
                checked={subFilter === "removeSub"}
                onChange={() => {
                  setSubFilter("removeSub");
                  setCurrentPage(1);
                }}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-xs font-medium text-slate-600">Remove Sub</span>
            </label>
          </div>

          {/* Counter */}
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {sortedContracts.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, sortedContracts.length)} of{" "}
              {sortedContracts.length}
            </span>
          </div>

          {currentDisplayedContracts.length === 0 ? (
            <div className="bg-white text-center py-12 rounded-xl shadow border border-gray-200 text-gray-500 mb-8">
              No contracts matched your current filters or search query terms.
            </div>
          ) : (
            <div className="mb-8">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b text-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-r">File No</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Division</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Name of Work</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Manager</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Contract Number</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Contract Value</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Penalty</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Started On</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Validity / Progress</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Extension</th>
                      <th className="px-4 py-3 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentDisplayedContracts.map((contract) => (
                      <tr
                        key={contract._id}
                        className={`transition-colors cursor-pointer ${
                          statusClasses[contract.status] || "bg-slate-200 text-slate-800"
                        }`}
                        onClick={() => navigate(`/dashboard/manager/bills/${contract.fileno}`)}
                      >
                        <td className="px-4 py-3 border-r font-semibold text-purple-700">
                          {contract.fileno || "N/A"}
                        </td>
                        <td className="px-4 py-3 font-medium border-r">
                          {contract.division || "N/A"}
                        </td>
                        <td className="px-4 py-3 border-r capitalize">
                          {contract.workname || "N/A"}
                        </td>
                        <td className="px-4 py-3 border-r">
                          <div className="flex text-center flex-col gap-1">
                            <p className="font-medium capitalize">{contract.managername || "N/A"}</p>
                            {contract.owner && (
                              <p className="capitalize bg-green-500 px-2 text-white text-xs rounded">
                                {contract.owner}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r break-all whitespace-normal">
                          {contract.contractNumber || "N/A"}
                        </td>
                        <td className="px-4 py-3 border-r">
                          ₹{Number(contract.contractvalue || 0).toLocaleString("en-IN")}
                        
                        </td>
                        <td className="px-2 py-2 border-r">
                          {(() => {
                            const contractValue = Number(contract.contractvalue || 0);
                            const billsForContract = matchedBills.filter((b) => b.fileno === contract.fileno);
                            const penalty = billsForContract.reduce((sum, bill) => sum + Number(bill.penalty || 0), 0);
                            const currentvalue = billsForContract.reduce((sum, bill) => sum + Number(bill.totalamount || 0), 0);
                            const maxPenalty = contractValue * 0.1;
                            const percentage = currentvalue > 0 ? ((penalty / currentvalue) * 100).toFixed(1) : 0;
                            const isHighPenalty = Number(percentage) > 4;

                            return (
                              <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                                <div className={`w-full text-center py-1 rounded font-bold text-white ${isHighPenalty ? "bg-red-600" : "bg-orange-500"}`}>
                                  {percentage}%
                                </div>
                                <div className={`w-full text-center py-1 rounded font-semibold ${isHighPenalty ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}`}>
                                  ₹{penalty.toLocaleString("en-IN")}
                                </div>
                                <div className="text-xs text-center text-slate-500">
                                  Max ₹{maxPenalty.toLocaleString("en-IN")}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 border-r whitespace-nowrap overflow-hidden text-ellipsis">
                          {formatDate(contract.startdate)}
                        </td>
                        <td className="px-4 py-3 border-r">
                          {(() => {
                            const contractBills = matchedBills.filter(
                              (bill) => bill.fileno === contract.fileno
                            );

                            const metrics = getContractBillingMetrics(contract, contractBills);
                            const datePercentage = getDateCompletionPercentage(contract);

                            const getDateColor = (pct) => {
                              if (pct >= 100) return "bg-purple-600";
                              if (pct >= 75) return "bg-red-500";
                              if (pct >= 50) return "bg-orange-500";
                              return "bg-indigo-600";
                            };

                            const getBillableColor = (pct) => {
                              if (pct >= 100) return "bg-emerald-600";
                              if (pct >= 75) return "bg-teal-500";
                              if (pct >= 50) return "bg-blue-500";
                              return "bg-sky-500";
                            };

                            return (
                              <div className="min-w-[220px] space-y-3" onClick={(e) => e.stopPropagation()}>
                                {/* Timeline Progress Bar */}
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-500">
                                      Timeline ({formatDate(contract.enddate)})
                                    </span>
                                    <span className="font-semibold text-slate-700">
                                      {datePercentage}%
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${getDateColor(datePercentage)} transition-all duration-500`}
                                      style={{ width: `${Math.min(100, datePercentage)}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Billable To Date % Progress Bar */}
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-500">
                                      Billable To Date
                                    </span>
                                    <span className="font-semibold text-emerald-700">
                                      {metrics.billableToDatePercentage}%
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${getBillableColor(metrics.billableToDatePercentage)} transition-all duration-500`}
                                      style={{ width: `${Math.min(100, metrics.billableToDatePercentage)}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Actual Billed Badge */}
                                <div className="flex items-center justify-between gap-1 pt-1">
                                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-semibold">
                                    Billed: ₹{metrics.actualBilledAmount.toLocaleString("en-IN")}
                                  </span>
                                </div>

                                {/* Active Contract Analytics */}
                                {!metrics.isExpired && (
                                  <div className="pt-1.5 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                                    {metrics.lastBillToDate && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Last Bill To:</span>
                                        <span className="font-semibold text-slate-700">
                                          {formatDate(metrics.lastBillToDate)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-400">Unbilled:</span>
                                      <span className="font-medium text-slate-700">
                                        ₹{Math.round(metrics.currentBillableValue-metrics.actualBilledAmount).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-400">Billable To-Date:</span>
                                      <span className="font-semibold text-slate-800">
                                        ₹{Math.round(metrics.currentBillableValue).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-400">Balance:</span>
                                      <span className="font-semibold text-emerald-700">
                                        ₹{Math.round(metrics.balanceToBill).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 border-r whitespace-nowrap text-center font-small font-semibold">
                          {contract.extension && (
                            <span>
                              {formatDate(contract.extension)}
                            </span>
                          )}

                            {Number(contract.extendedvalue) > 0 && (
                            <div className="underline">
                               ₹{Number(contract.extendedvalue).toLocaleString("en-IN")} <br />
                               Total: ₹{Number(contract.contractvalue || 0) + Number(contract.extendedvalue)}
                            </div>
                            
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {contract.status || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
                {currentDisplayedContracts.map((contract) => {
                  const contractBills = matchedBills.filter(
                    (bill) => bill.fileno === contract.fileno
                  );
                  const metrics = getContractBillingMetrics(contract, contractBills);

                  let progressColor = "bg-green-500";
                  if (metrics.billableToDatePercentage >= 100) progressColor = "bg-purple-600";
                  else if (metrics.billableToDatePercentage >= 75) progressColor = "bg-orange-500";
                  else if (metrics.billableToDatePercentage >= 50) progressColor = "bg-yellow-500";

                  const contractValue = Number(contract.contractvalue || 0);
                  const penalty = contractBills.reduce((sum, bill) => sum + Number(bill.penalty || 0), 0);

                  return (
                    <div
                      key={contract._id}
                      className="bg-white rounded-2xl p-3.5 shadow-sm hover:shadow-md border border-slate-200 active:scale-[0.98] transition cursor-pointer flex flex-col justify-between"
                      onClick={() => navigate(`/dashboard/manager/bills/${contract.fileno}`)}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                          <span className="font-bold text-purple-700 text-base">
                            {contract.fileno || "N/A"}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge[contract.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                            {contract.status || "N/A"}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-slate-800 text-xs line-clamp-2 mb-2 capitalize" title={contract.workname}>
                          {contract.workname || "N/A"}
                        </h4>

                        {/* Details */}
                        <div className="text-[11px] text-slate-600 space-y-1 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Division:</span>
                            <span className="font-medium text-slate-700">{contract.division || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Manager:</span>
                            <span className="font-medium text-slate-700 capitalize">{contract.managername || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Contract No:</span>
                            <span className="font-medium text-slate-700">{contract.contractNumber || "N/A"}</span>
                          </div>
                          {metrics.lastBillToDate && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Last Bill To:</span>
                              <span className="font-medium text-slate-700">{formatDate(metrics.lastBillToDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-700">
                            <span>Billable To Date: ₹{Math.round(metrics.currentBillableValue).toLocaleString("en-IN")}</span>
                            <span className="text-purple-700">{metrics.billableToDatePercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${progressColor} transition-all duration-300`} style={{ width: `${Math.min(100, metrics.billableToDatePercentage)}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Actual Billed:</span>
                          <span className="font-semibold text-blue-700">
                            ₹{metrics.actualBilledAmount.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Contract Value:</span>
                          <span className="font-bold text-slate-800">
                            ₹{contractValue.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {penalty > 0 && (
                          <div className="flex justify-between items-center text-red-600">
                            <span>Penalty:</span>
                            <span className="font-bold">₹{penalty.toLocaleString("en-IN")}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-slate-500">
                          <span>End Date:</span>
                          <span>{formatDate(contract.enddate)}</span>
                        </div>

                        {contract.extension && (
                          <div className="flex justify-between items-center text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <span>Extension:</span>
                            <span>{formatDate(contract.extension)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow border border-gray-200">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-600">
                    Page <strong className="text-slate-900">{currentPage}</strong> of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default Contracts;