import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import AdminMenu from "../../components/layout/AdminMenu";
import { 
  FaEdit, FaSave, FaTrash, FaTimes, FaPlus, FaFileInvoiceDollar, 
  FaSearch, FaFilter, FaSortAmountDown, FaFolderOpen, FaPercent, 
  FaCalendarAlt, FaBuilding, FaLayerGroup, FaFileDownload 
} from "react-icons/fa";
import { toast } from "react-toastify";
import BackButton from "../../components/layout/BackButton";
import * as XLSX from "xlsx"; // SheetJS for Excel exports

const Penalty = () => {
  const [auth] = useAuth();
  const [contractsMap, setContractsMap] = useState({}); 
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [penaltyFilter, setPenaltyFilter] = useState("All"); 
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [viewModeFilter, setViewModeFilter] = useState("All"); // All, HighContractPenalty, HasBills
  const [sortBy, setSortBy] = useState("date-desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [contractTab, setContractTab] = useState("Active");

  // Pagination Configuration
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const loadData = async () => {
    try {
      setLoading(true);

      const [contractsRes, billsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/getcontracts`),
        axios.get(`${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/getbills`)
      ]);

      const contracts = (contractsRes.data.contracts || contractsRes.data || []).sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
      );

      const mappedContracts = {};
      contracts.forEach((c) => {
        if (c.fileno) {
          mappedContracts[c.fileno] = c;
        }
      });

      setContractsMap(mappedContracts);

      const sortedBills = (billsRes.data.bills || []).sort(
        (a, b) => new Date(b.einvoicedate) - new Date(a.einvoicedate)
      );
      setBills(sortedBills);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.user) {
      loadData();
    }
  }, [auth?.user]);

  // Debounced Dynamic Search Endpoint handler
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/search/${searchQuery}`
          );
          setBills(res.data.bills || res.data || []);
          setCurrentPage(1); 
        } catch (err) {
          console.error("Error hitting search endpoint:", err);
        }
      } else if (auth?.user) {
        loadData();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, auth?.user]);

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return date; // Return the original text instead of "Invalid Date"
  }

  return parsedDate.toLocaleDateString("en-GB").replace(/\//g, "-");
};

  const formatCurrency = (num) => {
    if (num === undefined || num === null || isNaN(num)) return "-";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Extract unique divisions dynamically from cached contracts for filtering options
  const uniqueDivisions = useMemo(() => {
    const divisions = new Set();
    Object.values(contractsMap).forEach(c => {
      if (c.division) divisions.add(c.division);
    });
    return Array.from(divisions).sort();
  }, [contractsMap]);

  // Core Data Filtering & Sorting Computation Layer
  const filteredAndSortedBills = useMemo(() => {
    let result = [...bills];

    // 1. Client-side Search Matching Fallback
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((bill) =>
        (bill.billno || "").toLowerCase().includes(q) || 
        (bill.fileno || "").toLowerCase().includes(q)
      );
    }

    // 2. Status Filters
    if (statusFilter !== "All") {
      if (statusFilter === "E-Invoice_Pending") {
        result = result.filter((bill) => bill.einvoicedate && (!bill.amountpssd || bill.amountpssd === ""));
      } else {
        result = result.filter((bill) => (bill.status || "pending").toLowerCase() === statusFilter.toLowerCase());
      }
    }

    // 3. Custom E-Invoice Date Range Filter Logic
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((bill) => bill.einvoicedate && new Date(bill.einvoicedate) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((bill) => bill.einvoicedate && new Date(bill.einvoicedate) <= end);
    }

    // 4. Division Filter Lineage Integration
    if (divisionFilter !== "All") {
      result = result.filter((bill) => {
        const contract = contractsMap[bill.fileno];
        return contract && contract.division === divisionFilter;
      });
    }

    // 5. Individual Bill Penalty Percentage Filtering Logic
    if (penaltyFilter !== "All") {
      result = result.filter((bill) => {
        const gross = Number(bill.totalamount) || 0;
        const penaltyAmt = Number(bill.penalty) || 0;
        const penaltyPercent = gross > 0 ? (penaltyAmt / gross) * 100 : 0;

        if (penaltyFilter === "0-2") return penaltyPercent >= 0 && penaltyPercent <= 2;
        if (penaltyFilter === "2-4") return penaltyPercent > 2 && penaltyPercent <= 4;
        if (penaltyFilter === "4-6") return penaltyPercent > 4 && penaltyPercent <= 6;
        if (penaltyFilter === "6-10") return penaltyPercent > 6 && penaltyPercent <= 10;
        if (penaltyFilter === "10+") return penaltyPercent > 10;
        return true;
      });
    }

    // Sorting Mechanics
    result.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.month + "-01") - new Date(a.month + "-01");
      if (sortBy === "date-asc") return new Date(a.month + "-01") - new Date(b.month + "-01");
      if (sortBy === "amount-desc") return (b.totalamount || 0) - (a.totalamount || 0);
      if (sortBy === "amount-asc") return (a.totalamount || 0) - (b.totalamount || 0);
      return 0;
    });

    return result;
  }, [bills, contractsMap, searchQuery, statusFilter, penaltyFilter, divisionFilter, sortBy, startDate, endDate]);

const contractFilteredBills = useMemo(() => {
  let result = [...filteredAndSortedBills];

  // Contract Status Filter
  if (contractTab !== "All") {
    result = result.filter((bill) => {
      const contract = contractsMap[bill.fileno] || {};

      return (
        (contract.status || "").toLowerCase() ===
        contractTab.toLowerCase()
      );
    });
  }

  // Contract Penalty Filter
  if (viewModeFilter !== "All") {
    result = result.filter((bill) => {
      const contract = contractsMap[bill.fileno] || {};

      const contractValue = Number(contract.contractvalue) || 0;

      const totalPenalty = filteredAndSortedBills
        .filter((b) => b.fileno === bill.fileno)
        .reduce((sum, b) => sum + (Number(b.penalty) || 0), 0);

      const penaltyPercent =
        contractValue > 0
          ? (totalPenalty / contractValue) * 100
          : 0;

      if (viewModeFilter === "HighContractPenalty")
        return penaltyPercent > 4;

      if (viewModeFilter === "LowContractPenalty")
        return penaltyPercent <= 4;

      return true;
    });
  }

  return result;
}, [
  filteredAndSortedBills,
  contractsMap,
  contractTab,
  viewModeFilter,
]);
  


const totalPages = useMemo(() => {
  return Math.ceil(contractFilteredBills.length / itemsPerPage) || 1;
}, [contractFilteredBills]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);


const categorizedBills = useMemo(() => {
  const groups = {};

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginatedSlice = contractFilteredBills.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  paginatedSlice.forEach((bill) => {
    const key = bill.fileno || "UNASSIGNED";
    if (!groups[key]) groups[key] = [];
    groups[key].push(bill);
  });

  return groups;
}, [contractFilteredBills, currentPage]);

 const orderedFileNos = useMemo(() => {
   return Object.keys(categorizedBills).sort((a, b) => {
     const contractA = contractsMap[a] || {};
     const contractB = contractsMap[b] || {};
     return new Date(contractB.fileno || 0) - new Date(contractA.fileno || 0);
   });
 }, [categorizedBills, contractsMap]);

  // Client-Side Excel Workbook Builder function
  const handleExportExcel = () => {
    try {
      if (contractFilteredBills.length === 0) {
        toast.warning("No data matching applied filters to export.");
        return;
      }

      // Format flat tracking structures for cleaner row distribution
      const exportRows = contractFilteredBills.map((bill) => {
        const contract = contractsMap[bill.fileno] || {};
        const gross = Number(bill.netamount) || 0;
        const penaltyAmt = Number(bill.penalty) || 0;
        const calculatedPercentage = gross > 0 ? ((penaltyAmt / gross) * 100).toFixed(1) : "0.0";

        return {
          "File No": bill.fileno || "N/A",
          "Contract / Work Name": contract.workname || "N/A",
          "Division": contract.division || "N/A",
          "Project Manager": contract.managerName || "N/A",
          "Contract Value (₹)": contract.contractvalue || 0,
          "Bill Number": bill.billno || "N/A",
          "E-Invoice Date": bill.einvoicedate ? new Date(bill.einvoicedate).toDateString().split('T')[0] : "-",
          "Period From": bill.billfrom ? new Date(bill.billfrom).toDateString().split('T')[0] : "-",
          "Period To": bill.billto ? new Date(bill.billto).toDateString().split('T')[0] : "-",
          "Gross Amount (₹)": bill.totalamount || 0,
          "Amount Passed (₹)": bill.amountpssd || 0,
          "Passed Date": bill.billpassdt ? new Date(bill.billpassdt).toDateString().split('T')[0] : "-",
          "Penalty Levied (₹)": penaltyAmt,
          "Penalty %": `${calculatedPercentage}%`,
          "Bill Status": bill.status || "Processing"
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger Account Summary");

      // Auto-fit Column configurations dynamically
      const colWidths = Object.keys(exportRows[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...exportRows.map(row => String(row[key]).length)) + 3
      }));
      worksheet["!cols"] = colWidths;

      // Trigger standard browser download pipeline
      XLSX.writeFile(workbook, `Contract_Penalty_Report_${new Date().toDateString().split('T')[0]}.xlsx`);
      toast.success("Excel ledger file generated successfully!");
    } catch (err) {
      console.error("Export failure: ", err);
      toast.error("Failed to compile Excel file export");
    }
  };

  return (
    <Layout title="Bill History Categorized - Manager">
      <div className="flex flex-col bg-slate-50 min-h-screen font-sans">
        {loading ? (
          <div className="space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-32 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <main className="flex-1 p-6 overflow-x-hidden">
            <BackButton />

            {/* KPI STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Pending Operations Checklist</span>
                <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  {filteredAndSortedBills.filter(b => b.status !== "PASSED").length} Bills Awaiting Approval
                </span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Filtered Dataset Size</span>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  Showing {filteredAndSortedBills.length} Match Records
                </span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
                <span className="text-sm font-medium text-slate-500">Active Contract Ledgers</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {orderedFileNos.length} Bundles Listed
                </span>
              </div>
            </div>

            {/* FILTER & SORT ACTION CONTROLS */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <FaSearch size={14} />
                  </span>
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                    placeholder="Type to search Bill No or File No..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* CLIENT-SIDE EXCEL EXPORT BUTTON */}
                  <button
                    onClick={handleExportExcel}
                    disabled={filteredAndSortedBills.length === 0}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition-all cursor-pointer"
                  >
                    <FaFileDownload size={13} />
                    <span>Download Excel ({contractFilteredBills.length})</span>
                  </button>

                  {/* Scope View Mode (Bill-wise vs Contract-wise focuses) */}
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                    <FaLayerGroup size={11} className="text-slate-400" />
                    <select
                      className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer"
                      value={viewModeFilter}
                      onChange={(e) => setViewModeFilter(e.target.value)}
                    >
                      <option value="All">All Ledgers Scope</option>
                      <option value="HighContractPenalty">High Contract Penalty (&gt;4%)</option>
                      <option value="LowContractPenalty">Low Contract Penalty (≤4%)</option>
                    </select>
                  </div>

                  {/* Division Selection Dropdown */}
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                    <FaBuilding size={11} className="text-slate-400" />
                    <select
                      className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer"
                      value={divisionFilter}
                      onChange={(e) => setDivisionFilter(e.target.value)}
                    >
                      <option value="All">All Divisions</option>
                      {uniqueDivisions.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>

                  {/* Individual Item Penalty Filter */}
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                    <FaPercent size={11} className="text-slate-400" />
                    <select
                      className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer"
                      value={penaltyFilter}
                      onChange={(e) => setPenaltyFilter(e.target.value)}
                    >
                      <option value="All">All Item Penalties</option>
                      <option value="0-2">Up to 2% Penalty</option>
                      <option value="2-4">2% — 4% Penalty</option>
                      <option value="4-6">4% — 6% Penalty</option>
                      <option value="6-10">6% — 10% Penalty</option>
                      <option value="10+">Over 10% Penalty</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                    <FaFilter size={12} className="text-slate-400" />
                    <select
                      className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="PASSED">Bill Passed</option>
                      <option value="E-Invoice_Pending">E-Invoice Pending</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                    <FaSortAmountDown size={12} className="text-slate-400" />
                    <select
                      className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="date-desc">Date: Newest First</option>
                      <option value="date-asc">Date: Oldest First</option>
                      <option value="amount-desc">Amount: High to Low</option>
                      <option value="amount-asc">Amount: Low to High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DATE RANGE FILTERS */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-slate-400" />
                  <span>From E-Invoice Date:</span>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-slate-200 rounded-md p-1 bg-slate-50 focus:bg-white focus:outline-none text-slate-700 font-mono"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span>To Date:</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-slate-200 rounded-md p-1 bg-slate-50 focus:bg-white focus:outline-none text-slate-700 font-mono"
                  />
                </div>
                {(startDate || endDate) && (
                  <button 
                    onClick={() => { setStartDate(""); setEndDate(""); }}
                    className="text-red-500 hover:text-red-700 underline font-semibold cursor-pointer ml-auto"
                  >
                    Clear Range
                  </button>
                )}
              </div>
            </div>

            {/* CONTRACT STATUS TABS */}
            <div className="flex gap-2 mb-6">
              {["All", "Active", "Closed","Completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setContractTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    contractTab === tab ? "bg-indigo-600 text-white shadow" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* WORKBOOK BUNDLES GRID */}
            {orderedFileNos.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                <p className="text-slate-400 font-medium">No ledger accounts or bill items match your adjustments.</p>
              </div>
            ) : (
              orderedFileNos.map((fileno) => {
                const currentContract = contractsMap[fileno] || {};
                const contractBills = categorizedBills[fileno];

                // Calculations across parent structure
                const contractValue = Number(currentContract.contractvalue || 0);
                const totalAccumulatedPenalty = contractBills.reduce((sum, b) => sum + (Number(b.penalty) || 0), 0);
                const contractPenaltyPercentage = contractValue > 0 ? ((totalAccumulatedPenalty / contractValue) * 100).toFixed(1) : "0.0";
                const isHighContractPenalty = Number(contractPenaltyPercentage) > 4;
                const maxContractPenaltyAllowed = contractValue * 0.1;

                const contractTotals = contractBills.reduce((acc, bill) => {
                  acc.totalamount += (Number(bill.totalamount) || 0);
                  acc.gst += (Number(bill.gst) || (Number(bill.totalamount || 0) * 0.18));
                  acc.grossTotal += (Number(bill.totalamount || 0) + Number(bill.gst || (bill.totalamount || 0) * 0.18));
                  acc.netamount += (Number(bill.netamount) || 0);
                  acc.amountpssd += (Number(bill.amountpssd) || 0);
                  acc.penalty += (Number(bill.penalty) || 0);
                  return acc;
                }, { totalamount: 0, gst: 0, grossTotal: 0, netamount: 0, amountpssd: 0, penalty: 0 });

                return (
                  <div key={fileno} className="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Header with explicit live breakdown of contract context metrics */}
                    <div className="bg-slate-100 px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-1">
                          <FaFolderOpen size={18} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-800">
                              {currentContract.workname || "Contract Ledger Account"}
                            </h2>
                            {currentContract.division && (
                              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                {currentContract.division}
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                              {currentContract.status || "N/A"}
                            </span>
                          </div>

                          {/* Contract & Manager Meta Details */}
                          <div className="text-xs text-slate-500 font-mono flex flex-wrap gap-x-4 gap-y-1">
                            <span>File No: <strong className="text-slate-700">{fileno}</strong></span>
                            {contractValue > 0 && (
                              <span>Value: <strong className="text-slate-700">₹{formatCurrency(contractValue)}</strong></span>
                            )}
                            {currentContract.managername && (
                              <span>Manager: <strong className="text-slate-700">{currentContract.managername}</strong></span>
                            )}
                            {currentContract.managerphone && (
                              <span>Phone: <strong className="text-slate-700">{currentContract.managerphone || "123456789"}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Side metrics detailing live calculations */}
                      <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-inner">
                        <div className="text-center px-2">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Total Penalty</span>
                          <span className="text-xs font-bold font-mono text-slate-800">₹{formatCurrency(totalAccumulatedPenalty)}</span>
                        </div>
                        <div className="border-l border-slate-200 h-6"></div>
                        <div className="text-center px-2">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Max Penalty</span>
                          <span className="text-[10px] font-medium text-slate-500 font-mono">Max ₹{formatCurrency(maxContractPenaltyAllowed)}</span>
                        </div>
                        <div className="border-l border-slate-200 h-6"></div>
                        <div className="text-center px-2">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Total Penalty %</span>
                          <span className={`text-xs px-2 py-0.5 rounded font-black text-white ${isHighContractPenalty ? "bg-red-600 animate-pulse" : "bg-orange-500"}`}>
                            {contractPenaltyPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop View Table */}
                    <div className="hidden xl:block overflow-x-auto">
                      <table className="min-w-full text-[11px] font-medium text-slate-700 border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 whitespace-nowrap">
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">E-Invoice Date</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Bill No.</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Period From</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Period To</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Gross Total</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold text-emerald-700">Amount Passed</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Passed Date</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold text-red-600">Penalty</th>
                            <th className="px-2 py-2 text-center font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                          {contractBills.map((bill) => {
                            const gross = Number(bill.netamount) || 0;
                            const penaltyAmt = Number(bill.penalty) || 0;
                            const calculatedPercentage = gross > 0 ? ((penaltyAmt / gross) * 100).toFixed(1) : "0.0";

                            return (
                              <tr key={bill._id} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                                <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">{formatDate(bill.einvoicedate)}</td>
                                <td className="px-2 py-2 border-r border-slate-200 text-center font-bold text-indigo-600">{bill.billno || "N/A"}</td>
                                <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">{formatDate(bill.billfrom)}</td>
                                <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">{formatDate(bill.billto)}</td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-50/50">{formatCurrency(bill.totalamount)}</td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-emerald-700 font-bold bg-emerald-50/20">{formatCurrency(bill.amountpssd || 0)}</td>
                                <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">{formatDate(bill.billpassdt)}</td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-red-600 font-bold bg-red-50/10">
                                  {formatCurrency(penaltyAmt)} <span className="text-[9px] text-slate-400 font-sans font-normal">({calculatedPercentage}%)</span>
                                </td>
                                <td className="px-2 py-2 text-center font-sans">
                                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                    bill.status === "PASSED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}>
                                    {bill.status || "Processing"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-400 bg-slate-100 font-mono text-slate-900 font-bold whitespace-nowrap sticky bottom-0">
                          <tr>
                            <td colSpan="4" className="px-2 py-3 border-r border-slate-300 text-center font-sans text-[10px] tracking-wider text-slate-500 uppercase">Total Summary</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right bg-slate-200/50">{formatCurrency(contractTotals.totalamount)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-emerald-800 bg-emerald-50 font-extrabold">{formatCurrency(contractTotals.amountpssd)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-center text-slate-400">-</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-red-700 bg-red-50/40">{formatCurrency(contractTotals.penalty)}</td>
                            <td className="px-2 py-3 text-center text-slate-400 font-sans">-</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="block xl:hidden p-4 space-y-4 bg-slate-50/50">
                      {contractBills.map((bill) => {
                        const gross = Number(bill.totalamount) || 0;
                        const penaltyAmt = Number(bill.penalty) || 0;
                        const computedGst = Number(bill.gst || (gross * 0.18));

                        return (
                          <div key={bill._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm font-sans text-xs">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                              <span className="font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">Bill #{bill.billno || "N/A"}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${bill.status === "Bill Passed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{bill.status || "Processing"}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono">
                              <div><span className="text-slate-400 font-sans text-[11px] block">E-Invoice Date:</span><span>{formatDate(bill.einvoicedate)}</span></div>
                              <div><span className="text-slate-400 font-sans text-[11px] block">Period Range:</span><span className="text-slate-700 text-[11px]">{formatDate(bill.billfrom)} to {formatDate(bill.billto)}</span></div>
                              <hr className="col-span-2 my-1 border-slate-100" />
                              <div><span className="text-slate-400 font-sans text-[11px] block">Base Amount:</span><span className="font-semibold text-slate-800">₹ {formatCurrency(gross)}</span></div>
                              <div><span className="text-slate-400 font-sans text-[11px] block">GST (18%):</span><span className="text-slate-700">₹ {formatCurrency(computedGst)}</span></div>
                              <div><span className="text-slate-400 font-sans text-[11px] block">Gross Total:</span><span className="font-bold text-slate-900">₹ {formatCurrency(gross + computedGst)}</span></div>
                              <hr className="col-span-2 my-1 border-slate-100" />
                              <div><span className="text-slate-400 font-sans text-[11px] block">Passed Date:</span><span className="text-slate-700">{formatDate(bill.billpassdt)}</span></div>
                              <div><span className="text-slate-400 font-sans text-[11px] block">Amount Passed:</span><span className="font-bold text-emerald-700">₹ {formatCurrency(bill.amountpssd || 0)}</span></div>
                              <div className="col-span-2"><span className="text-slate-400 font-sans text-[11px] block">Item Penalty:</span><span className="font-bold text-red-600">₹ {formatCurrency(penaltyAmt)}</span></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow border border-slate-200">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-slate-600">Page <strong className="text-slate-900">{currentPage}</strong> of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        )}
      </div>
    </Layout>

  );
};

export default Penalty;