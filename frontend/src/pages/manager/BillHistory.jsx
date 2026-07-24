import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import AdminMenu from "../../components/layout/AdminMenu";
import { FaEdit, FaSave, FaTrash, FaTimes, FaPlus, FaFileInvoiceDollar, FaSearch, FaFilter, FaSortAmountDown, FaFolderOpen, FaPercent, FaCalendarAlt, FaFileDownload, FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify";
import BackButton from "../../components/layout/BackButton";
import * as XLSX from "xlsx"; // SheetJS for Excel exports

const BillHistory = () => {
  const [auth] = useAuth();
  const [contractsMap, setContractsMap] = useState({}); 
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [penaltyFilter, setPenaltyFilter] = useState("All"); 
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [contractTab, setContractTab] = useState("All");
  const [editingBill, setEditingBill] = useState(null);
  const [editData, setEditData] = useState({});
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
        (a, b) => new Date(b.fileno || 0) - new Date(a.fileno || 0)
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

  // ==================== SILENT AUTOMATIC EMAIL TRIGGER ====================
  useEffect(() => {
    const triggerAutoEmails = async () => {
      try {
        // Quietly pings the backend route to run the check and send emails
        await axios.post(`${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/invoiceupdate`);
      } catch (err) {
        // Suppress UI toasts and simply log errors internally for debugging
        console.error("Background automated invoice email check failed:", err);
      }
    };

    if (auth?.user) {
      triggerAutoEmails();
    }
  }, [auth?.user]);
  // ========================================================================

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

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "-";
  }

  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
};

const formatToInputDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

  const formatCurrency = (num) => {
    if (num === undefined || num === null || isNaN(num)) return "-";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Compute unique divisions array for dropdown selection
  const uniqueDivisions = useMemo(() => {
    const divisions = new Set();
    Object.values(contractsMap).forEach((contract) => {
      if (contract.division) {
        divisions.add(contract.division);
      }
    });
    return Array.from(divisions).sort();
  }, [contractsMap]);

  const filteredAndSortedBills = useMemo(() => {
    let result = [...bills];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((bill) =>
        (bill.billno || "").toLowerCase().includes(q) || 
        (bill.fileno || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      if (statusFilter === "E-Invoice_Pending") {
        result = result.filter((bill) => bill.einvoicedate && (!bill.amountpssd || bill.amountpssd === ""));
      } else {
        result = result.filter((bill) => (bill.status || "pending").toLowerCase() === statusFilter.toLowerCase());
      }
    }

    // Apply Division Filter
    if (divisionFilter !== "All") {
      result = result.filter((bill) => {
        const contract = contractsMap[bill.fileno];
        return contract && contract.division === divisionFilter;
      });
    }

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

    result.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.month + "-01") - new Date(a.month + "-01");
      if (sortBy === "date-asc") return new Date(a.month + "-01") - new Date(a.month + "-01");
      if (sortBy === "amount-desc") return (b.totalamount || 0) - (a.totalamount || 0);
      if (sortBy === "amount-asc") return (a.totalamount || 0) - (b.totalamount || 0);
      return 0;
    });

    return result;
  }, [bills, searchQuery, statusFilter, penaltyFilter, divisionFilter, sortBy, startDate, endDate, contractsMap]);

  const contractFilteredBills = useMemo(() => {
  if (contractTab === "All") return filteredAndSortedBills;

  return filteredAndSortedBills.filter((bill) => {
    const contract = contractsMap[bill.fileno] || {};
    return (
      (contract.status || "").toLowerCase() === contractTab.toLowerCase()
    );
  });
}, [filteredAndSortedBills, contractsMap, contractTab]);



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


const handleExportExcel = () => {
  try {
    if (contractFilteredBills.length === 0) {
      toast.warning("No data matching applied filters to export.");
      return;
    }

    const sortedBillsForExport = [...contractFilteredBills].sort((a, b) => {
      const fileA = String(a.fileno || "").trim();
      const fileB = String(b.fileno || "").trim();
      return fileA.localeCompare(fileB, undefined, { numeric: true, sensitivity: 'base' });
    });

    const formatIfDate = (val, key) => {
      if (!val) return "-";
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("date") || lowerKey.includes("dt")) {
        const parsed = new Date(val);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0]; 
        }
      }
      return val;
    };

  const exportRows = sortedBillsForExport.map((bill) => {
  const gross = Number(bill.netamount || 0);
  const penalty = Number(bill.penalty || 0);

  return {
    "File No": bill.fileno,
    "Bill No": bill.billno,
    "E-Invoice Date": formatIfDate(bill.einvoicedate, "date"),
    "Bill From": formatIfDate(bill.billfrom, "date"),
    "Bill To": formatIfDate(bill.billto, "date"),

    "Net Amount": bill.netamount,
    "GST": bill.gst,
    "Total Amount": bill.totalamount,

    "Amount Passed": bill.amountpssd,
    "Passed Date": formatIfDate(bill.billpassdt, "date"),

    "TDS": bill.tds,
    "GST TDS": bill.gsttds,
    "CC": bill.cc,
    "SD": bill.sd,
    "ESI/PF Penalty": bill.esi_pfpenalty,
    "Penalty": bill.penalty,
    "Others": bill.others,

    "Status": bill.status,
    "Penalty %": gross ? ((penalty / gross) * 100).toFixed(2) + "%" : "0%"
  };
});

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger Account Summary");

    const colWidths = Object.keys(exportRows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportRows.map(row => String(row[key] ?? '').length)) + 3
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `Contract_Complete_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel ledger file generated successfully with all fields!");
  } catch (err) {
    console.error("Export failure: ", err);
    toast.error("Failed to compile Excel file export");
  }
};

  const handleSave = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/update-bill/${editingBill}`,
        editData
      );

      toast.success("Bill updated");
      setEditingBill(null);
      loadData();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bill?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/delete-bill/${id}`
      );

      toast.success("Bill deleted");
      loadData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

const passedAmount = filteredAndSortedBills.reduce((sum, bill) => {
  const value = String(bill.amountpssd || "").replace(/,/g, "").trim();
  const amount = Number(value);

  return sum + (Number.isFinite(amount) ? amount : 0);
}, 0);
const pendingAmount = filteredAndSortedBills
  .filter(b => b.status === "PENDING")
  .reduce((sum, bill) => sum + Number(bill.totalamount || 0), 0);

const totalPenalty = filteredAndSortedBills.reduce((sum, bill) => {
  return (
    sum +
    Number(bill.penalty || 0) 
  );
}, 0);

const grandTotal = filteredAndSortedBills.reduce(
  (sum, bill) => {
    const value = String(bill.totalamount || "").replace(/,/g, "").trim();
    const amount = Number(value);
    return sum + (Number.isFinite(amount) ? amount : 0);
  },
  0
);

const formatIndianCurrency = (amount) => {
  if (!Number.isFinite(amount)) return "0";

  if (amount >= 10000000) {
    // 1 Crore = 1,00,00,000
    return `${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    // 1 Lakh = 1,00,000
    return `${(amount / 100000).toFixed(2)} L`;
  }

  return amount.toLocaleString("en-IN");
};

const getPendingBillStatus = (bills) => {
  if (!bills || bills.length === 0) return "No Bills";

  // Filter passed bills and sort by billto (latest first)
  const sortedPassedBills = bills
    .filter((bill) => bill.status === "PASSED")
    .sort((a, b) => new Date(b.billto || 0) - new Date(a.billto || 0));

  // The latest bill is now at index 0
  const lastBill = sortedPassedBills[0] || bills[bills.length - 1];

  const dateStr = lastBill.billto || 0;
  if (!dateStr) return "No Date Available";

  const lastBillDate = new Date(dateStr);
  const today = new Date();

  // Format month and year (e.g., "Jul 2019")
  const lastMonthName = lastBillDate.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Calculate pending months
  const yearDiff = today.getFullYear() - lastBillDate.getFullYear();
  const monthDiff = today.getMonth() - lastBillDate.getMonth();
  const pendingMonths = yearDiff * 12 + monthDiff;

  if (pendingMonths <= 0) {
    return `Last Passed: ${lastMonthName} • Up to date`;
  }

  return `Last Passed: ${lastMonthName} • ${pendingMonths} ${
    pendingMonths === 1 ? "Month" : "Months"
  } Pending`;
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
            {/* ====== FIXED HORIZONTAL SCROLL CONTROLS ====== */}
            <div className="fixed bottom-6 right-6 z-50 flex gap-2 shadow-lg rounded-xl bg-white/80 backdrop-blur border border-slate-200 p-1.5">
              <button
                onClick={() => {
                  const containers = document.querySelectorAll(".bulk-ledger-container");
                  containers.forEach(container => container.scrollBy({ left: -300, behavior: "smooth" }));
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors duration-150 focus:outline-none flex items-center justify-center"
                title="Scroll Left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              
              <button
                onClick={() => {
                  const containers = document.querySelectorAll(".bulk-ledger-container");
                  containers.forEach(container => container.scrollBy({ left: 300, behavior: "smooth" }));
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors duration-150 focus:outline-none flex items-center justify-center"
                title="Scroll Right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4 mb-6">

  {/* Pending Bills */}
  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
    <span className="text-sm font-medium text-slate-500">
      Pending Operations Checklist
    </span>
    <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
      {filteredAndSortedBills.filter(b => b.status !== "PASSED").length} Bills
    </span>
  </div>

  {/* Pending Amount */}
  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
    <span className="text-sm font-medium text-slate-500">
      Pending for Pass Amount
    </span>
    <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
      ₹ {formatIndianCurrency(pendingAmount)}
    </span>
  </div>

  {/* Passed Amount */}
  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
    <span className="text-sm font-medium text-slate-500">
      Passed Amount
    </span>
    <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
      ₹ {formatIndianCurrency(passedAmount)}
    </span>
  </div>

  {/* Total Penalty */}
  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
    <span className="text-sm font-medium text-slate-500">
      Total Penalty
    </span>
    <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
      ₹ {formatIndianCurrency(totalPenalty)}
    </span>
  </div>

  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
  <span className="text-sm font-medium text-slate-500">
    Total Bill Amount
  </span>
  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
    ₹ {formatIndianCurrency(grandTotal)}
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
                  <button
                    onClick={handleExportExcel}
                    disabled={filteredAndSortedBills.length === 0}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition-all cursor-pointer"
                  >
                    <FaFileDownload size={13} />
                    <span>Download Excel ({contractFilteredBills.length})</span>
                  </button>

                  {/* Division Filter Dropdown */}
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
              {["All", "Active", "Closed", "Completed"].map((tab) => (
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

                const contractTotals = contractBills.reduce((acc, bill) => {
                  acc.totalamount += (Number(bill.totalamount) || 0);
                  acc.gst += (Number(bill.gst) || (Number(bill.totalamount || 0) * 0.18));
                  acc.grossTotal += (Number(bill.totalamount || 0) + Number(bill.gst || (bill.totalamount || 0) * 0.18));
                  acc.netamount += (Number(bill.netamount) || 0);
                  acc.amountpssd += (Number(bill.amountpssd) || 0);
                  acc.tds += (Number(bill.tds) || 0);
                  acc.gsttds += (Number(bill.gsttds) || 0);
                  acc.cc += (Number(bill.cc) || 0);
                  acc.sd += (Number(bill.sd) || 0);
                  acc.esi_pfpenalty += (Number(bill.esi_pfpenalty) || 0);
                  acc.penalty += (Number(bill.penalty) || 0);
                  acc.others += (Number(bill.others) || 0);
                  return acc;
                }, { totalamount: 0, gst: 0, grossTotal: 0, netamount: 0, amountpssd: 0, tds: 0, gsttds: 0, cc: 0, sd: 0, esi_pfpenalty: 0, penalty: 0, others: 0 });



                return (
                  <div key={fileno} className="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-100 px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FaFolderOpen size={18} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-sm font-bold text-slate-800">
                            {currentContract.workname || "Contract Ledger Account"}
                          </h2>
                          <h2 className="text-sm font-bold text-slate-800">
                            {currentContract.division || ""}
                          </h2>
                          <p className="text-sm text-slate-500 font-mono">File No: {fileno}</p>
                          <span className="text-xs px-2 py-0.5 rounded font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
                            {currentContract.status || "N/A"}
                          </span>
                        </div>
                       
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full">
                          {contractBills.length} {contractBills.length === 1 ? "Bill Viewable" : "Bills Viewable"}
                        </span>

                         <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full">
  {currentContract?.status === "Active"
    ? getPendingBillStatus(contractBills)
    : ""}
</span>
                      </div>
                    </div>

                    {/* Desktop View Table */}
                    <div className="bulk-ledger-container hidden xl:block max-h-[600px] overflow-auto bg-white rounded-xl shadow-sm border border-slate-200 scroll-smooth">   
                      <table className="min-w-full text-[11px] font-medium text-slate-700 border-collapse"> 
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 whitespace-nowrap">
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">E-Invoice Date</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Bill No.</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Period From</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Period To</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Net Amount</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">GST</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Gross Total</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold text-emerald-700">Amount Passed</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Passed Date</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">TDS</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">GST TDS</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">CC Deduction</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Sec. Deposit (SD)</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold text-red-500">ESI/PF Penalty</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold text-red-600">Penalty</th>
                            <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Others</th>
                            <th className="px-2 py-2 text-center font-bold">Status</th>
                            <th className="px-2 py-2 text-center font-bold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                          {contractBills.map((bill) => {
                            const isEditing = editingBill === bill._id;
                            const gross = Number(isEditing ? editData.netamount : bill.netamount) || 0;
                            const penaltyAmt = Number(isEditing ? editData.penalty : bill.penalty) || 0;
                            const calculatedPercentage = gross > 0 ? ((penaltyAmt / gross) * 100).toFixed(1) : "0.0";

                            return (
                              <tr key={bill._id} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                                <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">
                                  {isEditing ? (
                                    <input 
                                      type="date" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-24"
                                      value={formatToInputDate(editData.einvoicedate)}
                                      onChange={(e) => setEditData({ ...editData, einvoicedate: e.target.value })}
                                    />
                                  ) : formatDate(bill.einvoicedate)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-center font-bold text-indigo-600">
                                  {isEditing ? (
                                    <input 
                                      type="text" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-16 text-center"
                                      value={editData.billno || ""}
                                      onChange={(e) => setEditData({ ...editData, billno: e.target.value })}
                                    />
                                  ) : bill.billno || "N/A"}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">
                                  {isEditing ? (
                                    <input 
                                      type="date" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-24"
                                      value={formatToInputDate(editData.billfrom)}
                                      onChange={(e) => setEditData({ ...editData, billfrom: e.target.value })}
                                    />
                                  ) : formatDate(bill.billfrom)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">
                                  {isEditing ? (
                                    <input 
                                      type="date" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-24"
                                      value={formatToInputDate(editData.billto)}
                                      onChange={(e) => setEditData({ ...editData, billto: e.target.value })}
                                    />
                                  ) : formatDate(bill.billto)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right font-semibold">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-20 text-right"
                                      value={editData.netamount || ""}
                                      onChange={(e) => setEditData({ ...editData, netamount: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.netamount)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-16 text-right"
                                      value={editData.gst || ""}
                                      onChange={(e) => setEditData({ ...editData, gst: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.gst)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-50/50">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-20 text-right"
                                      value={editData.totalamount || ""}
                                      onChange={(e) => setEditData({ ...editData, totalamount: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.totalamount)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-emerald-700 font-bold bg-emerald-50/20">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-20 text-right"
                                      value={editData.amountpssd || ""}
                                      onChange={(e) => setEditData({ ...editData, amountpssd: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.amountpssd || 0)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">
                                  {isEditing ? (
                                    <input 
                                      type="date" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-24"
                                      value={formatToInputDate(editData.billpassdt)}
                                      onChange={(e) => setEditData({ ...editData, billpassdt: e.target.value })}
                                    />
                                  ) : formatDate(bill.billpassdt)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-14 text-right"
                                      value={editData.tds || ""}
                                      onChange={(e) => setEditData({ ...editData, tds: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.tds || 0)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-14 text-right"
                                      value={editData.gsttds || ""}
                                      onChange={(e) => setEditData({ ...editData, gsttds: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.gsttds || 0)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-14 text-right"
                                      value={editData.cc || ""}
                                      onChange={(e) => setEditData({ ...editData, cc: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.cc || 0)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-14 text-right"
                                      value={editData.sd || ""}
                                      onChange={(e) => setEditData({ ...editData, sd: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.sd || 0)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-red-500">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-14 text-right"
                                      value={editData.esi_pfpenalty || ""}
                                      onChange={(e) => setEditData({ ...editData, esi_pfpenalty: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.esi_pfpenalty || 0)}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-red-600 font-bold bg-red-50/10">
                                  {isEditing ? (
                                    <div className="flex flex-col items-end">
                                      <input 
                                        type="number" 
                                        className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-14 text-right"
                                        value={editData.penalty || ""}
                                        onChange={(e) => setEditData({ ...editData, penalty: e.target.value })}
                                      />
                                      <span className="text-[9px] text-slate-400 font-sans font-normal">({calculatedPercentage}%)</span>
                                    </div>
                                  ) : (
                                    <>
                                      {formatCurrency(penaltyAmt)} <span className="text-[9px] text-slate-400 font-sans font-normal">({calculatedPercentage}%)</span>
                                    </>
                                  )}
                                </td>
                                <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="border border-slate-300 rounded px-1 py-0.5 text-[11px] w-14 text-right"
                                      value={editData.others || ""}
                                      onChange={(e) => setEditData({ ...editData, others: e.target.value })}
                                    />
                                  ) : formatCurrency(bill.others || 0)}
                                </td>
                                <td className="px-2 py-2 text-center font-sans">
                                  {isEditing ? (
                                    <select
                                      className="border border-slate-300 rounded text-[11px] p-0.5"
                                      value={editData.status || "PENDING"}
                                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                    >
                                      <option value="PENDING">Pending</option>
                                      <option value="PASSED">Bill Passed</option>
                                    </select>
                                  ) : (
                                    <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                      bill.status === "PASSED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                                    }`}>
                                      {bill.status || "Processing"}
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center">
                                  {isEditing ? (
                                    <div className="flex justify-center gap-2">
                                      <button
                                        onClick={handleSave}
                                        className="text-emerald-600 hover:text-emerald-800"
                                        title="Save"
                                      >
                                        <FaSave size={14} />
                                      </button>
                                      <button
                                        onClick={() => setEditingBill(null)}
                                        className="text-slate-500 hover:text-slate-700"
                                        title="Cancel"
                                      >
                                        <FaTimes size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center gap-2">
                                      <button
                                        onClick={() => {
                                          setEditingBill(bill._id);
                                          setEditData({ ...bill });
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Edit Inline"
                                      >
                                        <FaEdit size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(bill._id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete"
                                      >
                                        <FaTrash size={14} />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-400 bg-slate-100 font-mono text-slate-900 font-bold whitespace-nowrap sticky bottom-0">
                          <tr>
                            <td colSpan="4" className="px-2 py-3 border-r border-slate-300 text-center font-sans text-[10px] tracking-wider text-slate-500 uppercase">Total Summary</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-indigo-900 bg-slate-200/40">{formatCurrency(contractTotals.netamount)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">{formatCurrency(contractTotals.gst)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right bg-slate-200/50">{formatCurrency(contractTotals.totalamount)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-emerald-800 bg-emerald-50 font-extrabold">{formatCurrency(contractTotals.amountpssd)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-center text-slate-400">-</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">{formatCurrency(contractTotals.tds)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">{formatCurrency(contractTotals.gsttds)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">{formatCurrency(contractTotals.cc)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">{formatCurrency(contractTotals.sd)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-red-700">{formatCurrency(contractTotals.esi_pfpenalty)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-red-700 bg-red-50/40">{formatCurrency(contractTotals.penalty)}</td>
                            <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">{formatCurrency(contractTotals.others)}</td>
                            <td className="px-2 py-3 text-center text-slate-400 font-sans">-</td>
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
                        const calculatedPercentage = gross > 0 ? ((penaltyAmt / gross) * 100).toFixed(1) : "0.0";
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

export default BillHistory;