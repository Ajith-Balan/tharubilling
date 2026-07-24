import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import AdminMenu from "../../components/layout/AdminMenu";
import { toast } from "react-toastify";
import {
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaClipboardCheck,
  FaTimesCircle,
  FaBars,
  FaTimes,
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

const Contracts = () => {
  const [auth] = useAuth();
  const [contracts, setContracts] = useState([]);
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  // Search, Filter, & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  // Fetch contracts from API
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/getcontracts`
      );
      const sortedContracts = (res.data.contracts || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setContracts(sortedContracts);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch bills from API
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

  // Dynamic Search Endpoint Integration
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

  const getCompletionPercentage = (totalAmount, contractValue) => {
    if (!contractValue || contractValue <= 0) return 0;
    const percentage = (totalAmount / contractValue) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  };

  const contractPeriods = contracts.map((c) => c.fileno).filter(Boolean);
  const matchedBills = bills.filter((bill) =>
    contractPeriods.includes(bill.fileno)
  );

  const contractNotifications = contracts
    .filter((contract) => contract.status === "Active")
    .map((contract) => {
      const billAmount = matchedBills
        .filter((bill) => bill.fileno === contract.fileno)
        .reduce((sum, bill) => sum + Number(bill.totalamount || 0), 0);

      const percentage = getCompletionPercentage(
        billAmount,
        Number(contract.contractvalue || 0)
      );

      return {
        fileno: contract.fileno,
        contractNumber: contract.contractNumber,
        percentage,
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extract unique divisions dynamically from current dataset for the filter menu
  const uniqueDivisions = Array.from(
    new Set(contracts.map((c) => c.division).filter(Boolean))
  ).sort();

  // 1. Apply Filtering Matrix (Status, Division & Text Search)
  const filteredContracts = contracts.filter((contract) => {
    // Dropdown Status Filter
    if (
      statusFilter !== "All" &&
      contract.status?.toLowerCase() !== statusFilter.toLowerCase()
    ) {
      return false;
    }
    // Dynamic Division Filter
    if (divisionFilter !== "All" && contract.division !== divisionFilter) {
      return false;
    }
    // Client-side fallback text filter layer
    const searchLower = searchTerm.toLowerCase();
    return (
      (contract.fileno?.toLowerCase() || "").includes(searchLower) ||
      (contract.division?.toLowerCase() || "").includes(searchLower) ||
      (contract.workname?.toLowerCase() || "").includes(searchLower) ||
      (contract.contractNumber?.toLowerCase() || "").includes(searchLower)
    );
  });

  // 2. Apply Sorting Matrix
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

  // 3. Apply Pagination Math Engine
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

  // Export Filtered Contracts to Excel function
  const exportToExcel = () => {
    if (sortedContracts.length === 0) {
      toast.warn("No data available to export");
      return;
    }

    const exportData = sortedContracts.map((c) => {
      const contractBills = matchedBills.filter((b) => b.fileno === c.fileno);
      const totalBilled = contractBills.reduce(
        (sum, b) => sum + (Number(b.totalamount) || 0),
        0
      );
      const totalPenalty = contractBills.reduce(
        (sum, b) => sum + (Number(b.penalty) || 0),
        0
      );

      return {
        "File No": c.fileno || "N/A",
        Division: c.division || "N/A",
        "Name of Work": c.workname || "N/A",
        Manager: c.managername || "N/A",
        Owner: c.owner || "N/A",
        "Contract Number": c.contractNumber || "N/A",
        "Contract Value (₹)": Number(c.contractvalue || 0),
        "Total Penalty (₹)": totalPenalty,
        "Start Date": formatDate(c.startdate),
        "End Date": formatDate(c.enddate),
        Status: c.status || "N/A",
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
        <main className="flex-1 p-4 lg:p-6">
          <BackButton />

          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Contract Dashboard
            </h1>

            {/* Excel Export Button with Count */}
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow transition duration-200"
            >
              <FaFileExcel className="text-lg" />
              <span>Export Excel ({sortedContracts.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {/* Total */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white shadow-lg hover:scale-105 transition duration-300">
              <div className="absolute -right-5 -top-5 opacity-20">
                <FaFolderOpen size={80} />
              </div>

              <p className="text-sm font-medium opacity-90">Total Contracts</p>
              <h2 className="text-4xl font-bold mt-2">{contracts.length}</h2>
              <p className="text-xs mt-3 opacity-80">All registered contracts</p>
            </div>

            {/* Active */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white shadow-lg hover:scale-105 transition duration-300">
              <div className="absolute -right-5 -top-5 opacity-20">
                <FaCheckCircle size={80} />
              </div>

              <p className="text-sm font-medium opacity-90">Active Contracts</p>
              <h2 className="text-4xl font-bold mt-2">
                {contracts.filter((c) => c.status === "Active").length}
              </h2>
              <p className="text-xs mt-3 opacity-80">Currently running</p>
            </div>

            {/* Completed */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 p-5 text-white shadow-lg hover:scale-105 transition duration-300">
              <div className="absolute -right-5 -top-5 opacity-20">
                <FaClipboardCheck size={80} />
              </div>

              <p className="text-sm font-medium opacity-90">Completed</p>
              <h2 className="text-4xl font-bold mt-2">
                {contracts.filter((c) => c.status === "Completed").length}
              </h2>
              <p className="text-xs mt-3 opacity-80">Successfully finished</p>
            </div>

            {/* Closed */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 p-5 text-white shadow-lg hover:scale-105 transition duration-300">
              <div className="absolute -right-5 -top-5 opacity-20">
                <FaTimesCircle size={80} />
              </div>

              <p className="text-sm font-medium opacity-90">Closed Contracts</p>
              <h2 className="text-4xl font-bold mt-2">
                {contracts.filter((c) => c.status === "Closed").length}
              </h2>
              <p className="text-xs mt-3 opacity-80">No longer active</p>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md border hover:bg-gray-100 transition"
              >
                <FaBell className="text-xl text-gray-700" />

                {contractNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {contractNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 bg-blue-600 text-white">
                    <h3 className="font-semibold text-lg">Notifications</h3>

                    <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold">
                      {contractNotifications.length}
                    </span>
                  </div>

                  {/* Body */}
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
                              {item.contractNumber &&
                                `- ${item.contractNumber}`}
                            </h4>

                            <p className="text-sm text-gray-600 mt-1">
                              Contract amount reached{" "}
                              <span className="font-bold text-red-600">
                                100%
                              </span>
                              .
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-5 py-3 bg-gray-50 text-center text-xs text-gray-500">
                    Total Notifications: {contractNotifications.length}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Row: Search, Filter & Sort */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contracts (File No, Work Name, Div)..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-sm px-3 py-1.5">
              <FaBuilding className="text-slate-500 mr-2" />
              <select
                value={divisionFilter}
                onChange={(e) => {
                  setDivisionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer pr-2 text-sm max-w-[160px]"
              >
                <option value="All">All Divisions</option>
                {uniqueDivisions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-sm px-3 py-1.5">
              <FaFilter className="text-slate-500 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer pr-2 text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-sm px-3 py-1.5">
              <FaSortAmountDown className="text-slate-500 mr-2" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer pr-2 text-sm"
              >
                <option value="date-desc">Newest Start Date</option>
                <option value="date-asc">Oldest Start Date</option>
                <option value="value-desc">Value: High to Low</option>
                <option value="value-asc">Value: Low to High</option>
              </select>
            </div>
          </div>

          {/* Table Header Section */}
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
              {/* Desktop view for Contracts */}
              <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b text-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-r">
                        File No
                      </th>
                      <th className="px-4 py-3 text-left font-semibold border-r">
                        Division
                      </th>
                      <th className="px-4 py-3 text-left font-semibold border-r">
                        Name of Work
                      </th>
                      <th className="px-4 py-3 text-left font-semibold border-r">
                        Manager
                      </th>
                      <th className="px-4 py-3 text-left font-semibold border-r">
                        Contract Number
                      </th>
                      <th className="px-4 py-3 text-left font-semibold border-r">
                        Contract Value
                      </th>
                      <th className="px-4 py-3 text-left font-semibold border-r">
                        Penalty
                      </th>
                      <th className="px-4 py-3 text-left font-semibold border-r">
                        Started On
                      </th>
                      <th className="px-4 py-3 text-left font-semibold border-r">
                        Validity / End Date
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentDisplayedContracts.map((contract) => (
                      <tr
                        key={contract._id}
                        className={`transition-colors cursor-pointer ${
                          statusClasses[contract.status] ||
                          "bg-slate-200 text-slate-800"
                        }`}
                        onClick={() =>
                          navigate(
                            `/dashboard/manager/bills/${contract.fileno}`
                          )
                        }
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
                            <div>
                              <p className="font-medium capitalize">
                                {contract.managername || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="capitalize bg-green-500 px-2 text-white text-xs rounded">
                                {contract.owner || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r">
                          {contract.contractNumber || "N/A"}
                        </td>
                        <td className="px-4 py-3 border-r">
                          ₹
                          {Number(
                            contract.contractvalue || 0
                          ).toLocaleString("en-IN")}
                        </td>
                        <td className="px-2 py-2 border-r">
                          {(() => {
                            const contractValue = Number(
                              contract.contractvalue || 0
                            );
                            const bills = matchedBills.filter(
                              (b) => b.fileno === contract.fileno
                            );
                            const penalty = bills.reduce(
                              (sum, bill) => sum + Number(bill.penalty || 0),
                              0
                            );
                            const maxPenalty = contractValue * 0.1;
                            const percentage =
                              contractValue > 0
                                ? ((penalty / contractValue) * 100).toFixed(1)
                                : 0;
                            const isHighPenalty = Number(percentage) > 4;

                            return (
                              <div
                                className="space-y-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div
                                  className={`w-full text-center py-1 rounded font-bold text-white ${
                                    isHighPenalty
                                      ? "bg-red-600"
                                      : "bg-orange-500"
                                  }`}
                                >
                                  {percentage}%
                                </div>
                                <div
                                  className={`w-full text-center py-1 rounded font-semibold ${
                                    isHighPenalty
                                      ? "bg-red-100 text-red-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  ₹{penalty.toLocaleString("en-IN")}
                                </div>
                                <div className="text-xs text-center text-slate-500">
                                  Max ₹{maxPenalty.toLocaleString("en-IN")}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 border-r whitespace-nowrap text-center font-semibold text-purple-700">
                          {formatDate(contract.startdate) || "N/A"}
                        </td>
                        <td className="px-4 py-3 border-r">
                          {(() => {
                            const billAmount = matchedBills
                              .filter(
                                (bill) => bill.fileno === contract.fileno
                              )
                              .reduce(
                                (sum, bill) =>
                                  sum + (Number(bill.totalamount) || 0),
                                0
                              );

                            const percentage = getCompletionPercentage(
                              billAmount,
                              contract.contractvalue
                            );
                            let color = "bg-red-500";
                            if (percentage < 25) color = "bg-green-500";
                            else if (percentage < 50) color = "bg-yellow-500";
                            else if (percentage < 75) color = "bg-orange-500";

                            return (
                              <div
                                className="min-w-[180px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="font-medium">
                                    {formatDate(contract.enddate)}
                                  </span>
                                  <span className="font-semibold">
                                    {percentage}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${color} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  ₹{billAmount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className={`px-4 py-3 text-center font-bold`}>
                          {contract.status || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card System */}
              <div className="md:hidden space-y-4">
                {currentDisplayedContracts.map((contract) => (
                  <div
                    key={contract._id}
                    className="bg-white rounded-xl shadow border border-gray-200 p-4 cursor-pointer"
                    onClick={() =>
                      navigate(`/dashboard/manager/bills/${contract.fileno}`)
                    }
                  >
                    <h3 className="font-bold text-purple-700 mb-2">
                      {contract.fileno || "N/A"}
                    </h3>
                    <p>
                      <span className="font-semibold">Division:</span>{" "}
                      {contract.division || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Work:</span>{" "}
                      {contract.workname || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Contract No:</span>{" "}
                      {contract.contractNumber || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Value:</span> ₹
                      {Number(
                        contract.contractvalue || 0
                      ).toLocaleString("en-IN")}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {contract.status || "N/A"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination Component */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow border border-gray-200">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-600">
                    Page{" "}
                    <strong className="text-slate-900">{currentPage}</strong>{" "}
                    of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
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