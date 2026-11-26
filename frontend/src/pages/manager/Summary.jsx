import React, { useState, useEffect, useMemo, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaFolderOpen,
  FaCalendarAlt,
  FaFileDownload,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
  FaFileInvoice,
  FaCalculator,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLayerGroup,
} from "react-icons/fa";
import { toast } from "react-toastify";
import BackButton from "../../components/layout/BackButton";
import * as XLSX from "xlsx";

const Summary = () => {
  const [auth] = useAuth();
  const [contractsMap, setContractsMap] = useState({});
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filter & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "No_EInvoice" | "E-Invoice_Pending" | "PASSED" | "PENDING"
  const [eInvoiceFilter, setEInvoiceFilter] = useState("All"); // "All" | "Not_Taken" | "Taken"
  const [ownerFilter, setOwnerFilter] = useState("All"); // "All" | "Sub Only" | "Remove Sub"
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [contractTab, setContractTab] = useState("Active"); // "All" | "Active" | "Closed" | "Completed"
  const [minPendingMonths, setMinPendingMonths] = useState(0);
  const [amountRange, setAmountRange] = useState("All"); // "All" | "under_1L" | "1L_5L" | "above_5L"
  const [sortBy, setSortBy] = useState("pending-desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination Configuration
  const [currentPage, setCurrentPage] = useState(1);
  const contractsPerPage = 10;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [contractsRes, billsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/getcontracts`),
        axios.get(`${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/getbills`),
      ]);

      const contracts = (contractsRes.data.contracts || contractsRes.data || []).sort(
        (a, b) =>
          String(b.fileno || "").localeCompare(String(a.fileno || ""), undefined, {
            numeric: true,
          })
      );

      const mappedContracts = {};
      contracts.forEach((c) => {
        if (c.fileno) {
          mappedContracts[String(c.fileno).trim()] = c;
        }
      });

      setContractsMap(mappedContracts);

      const rawBills = billsRes.data.bills || billsRes.data || [];
      setBills(rawBills);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load contracts and bills data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth?.user) {
      loadData();
    }
  }, [auth?.user, loadData]);

  // Silent automatic invoice email sync
  useEffect(() => {
    const triggerAutoEmails = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/invoiceupdate`);
      } catch (err) {
        console.error("Background automated invoice email check failed:", err);
      }
    };

    if (auth?.user) {
      triggerAutoEmails();
    }
  }, [auth?.user]);

  const formatDate = useCallback((date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB").replace(/\//g, "-");
  }, []);

  const formatCurrency = useCallback((num) => {
    if (num === undefined || num === null || isNaN(Number(num))) return "0";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number(num));
  }, []);

  const formatCompactINR = useCallback((amount) => {
    const num = Number(amount);
    if (!Number.isFinite(num)) return "0";
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
    return num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }, []);

  const getPendingMonthsFromDate = useCallback((dateValue) => {
    if (!dateValue) return 0;
    const parsed = new Date(dateValue);
    if (isNaN(parsed.getTime())) return 0;
    const today = new Date();
    const months =
      (today.getFullYear() - parsed.getFullYear()) * 12 +
      (today.getMonth() - parsed.getMonth());
    return Math.max(0, months);
  }, []);

  const getBillCategory = useCallback((bill) => {
    const statusUpper = String(bill.status || "PENDING").trim().toUpperCase();
    const hasEInvoice = Boolean(bill.einvoicedate);
    const rawPassed = String(bill.amountpssd ?? "").trim();
    const isPassedEmpty =
      rawPassed === "" || rawPassed === "0" || Number(rawPassed) === 0;

    if (statusUpper === "PASSED") {
      return {
        key: "PASSED",
        label: "Passed",
        hasEInvoice,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }

    if (!hasEInvoice) {
      return {
        key: "NO_EINVOICE",
        label: "E-Invoice Not Taken",
        hasEInvoice: false,
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      };
    }

    if (isPassedEmpty) {
      return {
        key: "EINVOICE_PENDING",
        label: "E-Invoice Pending",
        hasEInvoice: true,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      key: "PENDING",
      label: "Pending",
      hasEInvoice: true,
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    };
  }, []);

  const findContractForFileNo = useCallback(
    (fileno) => {
      const normalized = String(fileno || "").trim().toLowerCase();
      if (!normalized) return null;
      if (contractsMap[String(fileno).trim()]) {
        return contractsMap[String(fileno).trim()];
      }
      return (
        Object.values(contractsMap).find(
          (c) => String(c.fileno || "").trim().toLowerCase() === normalized
        ) || null
      );
    },
    [contractsMap]
  );

  const isSubOwner = useCallback((contract) => {
    const owner = String(contract?.owner || "").trim().toLowerCase();
    return owner === "sub" || owner.includes("sub ");
  }, []);

  const uniqueDivisions = useMemo(() => {
    const divisions = new Set();
    Object.values(contractsMap).forEach((contract) => {
      if (contract.division) {
        divisions.add(String(contract.division).trim());
      }
    });
    return Array.from(divisions).sort();
  }, [contractsMap]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setEInvoiceFilter("All");
    setOwnerFilter("All");
    setDivisionFilter("All");
    setContractTab("Active");
    setMinPendingMonths(0);
    setAmountRange("All");
    setSortBy("pending-desc");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== "All") count++;
    if (eInvoiceFilter !== "All") count++;
    if (ownerFilter !== "All") count++;
    if (divisionFilter !== "All") count++;
    if (contractTab !== "All") count++;
    if (minPendingMonths > 0) count++;
    if (amountRange !== "All") count++;
    if (startDate || endDate) count++;
    return count;
  }, [
    searchQuery,
    statusFilter,
    eInvoiceFilter,
    ownerFilter,
    divisionFilter,
    contractTab,
    minPendingMonths,
    amountRange,
    startDate,
    endDate,
  ]);

  // Enrich bills with pending months, bill type, and contract metadata
  const enrichedBills = useMemo(() => {
    return bills
      .map((bill) => {
        const contract = findContractForFileNo(bill.fileno) || {};
        const category = getBillCategory(bill);
        const amount = Number(bill.totalamount || bill.netamount || 0) || 0;
        const passedAmount = Number(String(bill.amountpssd || 0).replace(/,/g, "")) || 0;
        const refDate = bill.billto || bill.einvoicedate || contract.startdate;
        const pendingMonths =
          category.key === "PASSED" ? 0 : getPendingMonthsFromDate(refDate);

        return {
          ...bill,
          _contract: contract,
          _category: category,
          _amount: amount,
          _passedAmount: passedAmount,
          _pendingMonths: pendingMonths,
        };
      })
      .filter((item) => {
        // Search filter
        if (searchQuery.trim() !== "") {
          const q = searchQuery.trim().toLowerCase();
          const matchesBillNo = String(item.billno || "").toLowerCase().includes(q);
          const matchesFileNo = String(item.fileno || "").toLowerCase().includes(q);
          const matchesWork = String(item._contract.workname || "").toLowerCase().includes(q);
          if (!matchesBillNo && !matchesFileNo && !matchesWork) return false;
        }

        // Contract tab filter
        if (contractTab !== "All") {
          if (
            String(item._contract.status || "").toLowerCase() !==
            contractTab.toLowerCase()
          ) {
            return false;
          }
        }

        // Division filter
        if (divisionFilter !== "All") {
          if (String(item._contract.division || "").trim() !== divisionFilter) {
            return false;
          }
        }

        // Owner filter
        if (ownerFilter === "Sub Only" && !isSubOwner(item._contract)) {
          return false;
        }
        if (ownerFilter === "Remove Sub" && isSubOwner(item._contract)) {
          return false;
        }

        // Status filter
        if (statusFilter === "No_EInvoice" && item._category.key !== "NO_EINVOICE") {
          return false;
        }
        if (
          statusFilter === "E-Invoice_Pending" &&
          item._category.key !== "EINVOICE_PENDING"
        ) {
          return false;
        }
        if (statusFilter === "PASSED" && item._category.key !== "PASSED") {
          return false;
        }
        if (statusFilter === "PENDING" && item._category.key === "PASSED") {
          return false;
        }

        // E-Invoice taken / not taken filter
        if (eInvoiceFilter === "Not_Taken" && item._category.hasEInvoice) {
          return false;
        }
        if (eInvoiceFilter === "Taken" && !item._category.hasEInvoice) {
          return false;
        }

        // Minimum pending months filter
        if (minPendingMonths > 0 && item._pendingMonths < Number(minPendingMonths)) {
          return false;
        }

        // Amount range filter
        if (amountRange === "under_1L" && item._amount >= 100000) return false;
        if (
          amountRange === "1L_5L" &&
          (item._amount < 100000 || item._amount > 500000)
        ) {
          return false;
        }
        if (amountRange === "above_5L" && item._amount <= 500000) return false;

        // Date range filter (on einvoicedate or billto)
        const targetDateStr = item.einvoicedate || item.billto;
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (!targetDateStr || new Date(targetDateStr) < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (!targetDateStr || new Date(targetDateStr) > end) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "pending-desc") return b._pendingMonths - a._pendingMonths;
        if (sortBy === "pending-asc") return a._pendingMonths - b._pendingMonths;
        if (sortBy === "amount-desc") return b._amount - a._amount;
        if (sortBy === "amount-asc") return a._amount - b._amount;
        if (sortBy === "date-desc") {
          return new Date(b.einvoicedate || b.billto || 0) - new Date(a.einvoicedate || a.billto || 0);
        }
        if (sortBy === "date-asc") {
          return new Date(a.einvoicedate || a.billto || 0) - new Date(b.einvoicedate || b.billto || 0);
        }
        return 0;
      });
  }, [
    bills,
    findContractForFileNo,
    getBillCategory,
    getPendingMonthsFromDate,
    searchQuery,
    contractTab,
    divisionFilter,
    ownerFilter,
    isSubOwner,
    statusFilter,
    eInvoiceFilter,
    minPendingMonths,
    amountRange,
    startDate,
    endDate,
    sortBy,
  ]);

  // Summary metrics (average amount, counts, pending months)
  const summaryStats = useMemo(() => {
    const pendingItems = enrichedBills.filter((b) => b._category.key !== "PASSED");
    const noEInvoiceItems = pendingItems.filter((b) => !b._category.hasEInvoice);
    const passedItems = enrichedBills.filter((b) => b._category.key === "PASSED");

    const pendingTotalAmount = pendingItems.reduce((acc, b) => acc + b._amount, 0);
    const noEInvoiceTotalAmount = noEInvoiceItems.reduce((acc, b) => acc + b._amount, 0);
    const passedTotalAmount = passedItems.reduce((acc, b) => acc + b._passedAmount, 0);

    const avgPendingAmount =
      pendingItems.length > 0 ? pendingTotalAmount / pendingItems.length : 0;

    const avgNoEInvoiceAmount =
      noEInvoiceItems.length > 0
        ? noEInvoiceTotalAmount / noEInvoiceItems.length
        : 0;

    const totalPendingMonths = pendingItems.reduce(
      (acc, b) => acc + b._pendingMonths,
      0
    );

    const avgPendingMonths =
      pendingItems.length > 0 ? totalPendingMonths / pendingItems.length : 0;

    return {
      totalCount: enrichedBills.length,
      pendingCount: pendingItems.length,
      noEInvoiceCount: noEInvoiceItems.length,
      passedCount: passedItems.length,
      pendingTotalAmount,
      noEInvoiceTotalAmount,
      passedTotalAmount,
      avgPendingAmount,
      avgNoEInvoiceAmount,
      avgPendingMonths,
    };
  }, [enrichedBills]);

  // Group filtered bills by contract File No
  const groupedContractRows = useMemo(() => {
    const map = new Map();

    enrichedBills.forEach((bill) => {
      const key = String(bill.fileno || "UNASSIGNED").trim();
      if (!map.has(key)) {
        const contract = findContractForFileNo(key) || {};
        map.set(key, {
          fileno: key,
          contract,
          bills: [],
          pendingMonths: 0,
          totalAmount: 0,
          avgAmount: 0,
        });
      }
      const group = map.get(key);
      group.bills.push(bill);
      group.pendingMonths = Math.max(group.pendingMonths, bill._pendingMonths);
      group.totalAmount += bill._amount;
    });

    const list = Array.from(map.values()).map((g) => ({
      ...g,
      avgAmount: g.bills.length > 0 ? g.totalAmount / g.bills.length : 0,
    }));

    if (sortBy === "pending-desc") {
      list.sort((a, b) => b.pendingMonths - a.pendingMonths);
    } else if (sortBy === "amount-desc") {
      list.sort((a, b) => b.totalAmount - a.totalAmount);
    } else {
      list.sort((a, b) =>
        String(b.fileno).localeCompare(String(a.fileno), undefined, {
          numeric: true,
        })
      );
    }

    return list;
  }, [enrichedBills, findContractForFileNo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(groupedContractRows.length / contractsPerPage));

  const paginatedContractGroups = useMemo(() => {
    const start = (currentPage - 1) * contractsPerPage;
    return groupedContractRows.slice(start, start + contractsPerPage);
  }, [groupedContractRows, currentPage]);

  const handleExportExcel = () => {
    try {
      if (enrichedBills.length === 0) {
        toast.warning("No bill summary records match the selected filters.");
        return;
      }

      const rows = enrichedBills.map((item, idx) => ({
        "S. No": idx + 1,
        "Bill No": item.billno || "N/A",
        "File No": item.fileno || "-",
        "Work Name": item._contract.workname || "-",
        "Division": item._contract.division || "-",
        "Bill Type": item._category.label,
        "E-Invoice Taken": item._category.hasEInvoice ? "Yes" : "No",
        "E-Invoice Date": item._category.hasEInvoice ? formatDate(item.einvoicedate) : "Not Taken",
        "Period From": formatDate(item.billfrom),
        "Period To": formatDate(item.billto),
        "Pending Months": item._pendingMonths,
        "Bill Amount": item._amount,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Bill Summary");

      const colWidths = Object.keys(rows[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length)) + 3,
      }));
      worksheet["!cols"] = colWidths;

      XLSX.writeFile(
        workbook,
        `Pending_Bill_Details_Summary_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success("Pending bill summary exported to Excel.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel summary.");
    }
  };

  return (
    <Layout title="Pending Bill Details Summary">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30 font-sans text-slate-800">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <BackButton />
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Pending Bill Details Summary
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Bill type &amp; e-invoice status, pending months, serial/bill numbers, and average bill amount
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {/* <FaRotateLeft size={12} /> */}
                  <span>Reset ({activeFilterCount})</span>
                </button>
              )}

              <button
                onClick={handleExportExcel}
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition cursor-pointer"
              >
                <FaFileDownload size={13} />
                <span>Export Summary ({enrichedBills.length})</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 bg-white rounded-2xl border border-slate-200/80 animate-pulse"
                  />
                ))}
              </div>
              <div className="h-44 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
              <div className="h-80 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
            </div>
          ) : (
            <>
              {/* KPI Summary Cards (Average Amount & Pending Metrics) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Average Pending Amount
                    </span>
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                      <FaCalculator size={14} />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-indigo-700 font-mono">
                    ₹ {formatCompactINR(summaryStats.avgPendingAmount)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Across {summaryStats.pendingCount} pending bills (Total: ₹{" "}
                    {formatCompactINR(summaryStats.pendingTotalAmount)})
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      E-Invoice Not Taken
                    </span>
                    <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                      <FaExclamationTriangle size={14} />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-rose-600 font-mono">
                    {summaryStats.noEInvoiceCount} Bills
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Avg amount: ₹ {formatCompactINR(summaryStats.avgNoEInvoiceAmount)}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Avg Pending Months
                    </span>
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                      <FaClock size={14} />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-amber-600 font-mono">
                    {summaryStats.avgPendingMonths.toFixed(1)} Mos
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Mean delay across active pending items
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Passed Bills
                    </span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <FaCheckCircle size={14} />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                    {summaryStats.passedCount} Bills
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Passed value: ₹ {formatCompactINR(summaryStats.passedTotalAmount)}
                  </p>
                </div>
              </div>

              {/* Advanced Filter Panel */}
              <section className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 mb-6 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Search */}
                  <div className="relative flex-1 max-w-lg">
                    <FaSearch
                      size={13}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search by Bill No, File No, or Work Name..."
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* Quick Pill Tabs: Contract Status */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {["All", "Active", "Closed", "Completed"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setContractTab(tab);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          contractTab === tab
                            ? "bg-white text-indigo-700 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Filter Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
                  {/* Bill Type / Status */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FaFilter size={9} /> Bill Type
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="All">All Bill Types</option>
                      <option value="No_EInvoice">E-Invoice Not Taken</option>
                      <option value="E-Invoice_Pending">E-Invoice Pending</option>
                      <option value="PENDING">All Pending</option>
                      <option value="PASSED">Passed</option>
                    </select>
                  </div>

                  {/* E-Invoice Flag */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FaFileInvoice size={9} /> E-Invoice Status
                    </label>
                    <select
                      value={eInvoiceFilter}
                      onChange={(e) => {
                        setEInvoiceFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="All">All E-Invoice States</option>
                      <option value="Not_Taken">Not Taken Only</option>
                      <option value="Taken">E-Invoice Taken</option>
                    </select>
                  </div>

                  {/* Division */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FaBuilding size={9} /> Division
                    </label>
                    <select
                      value={divisionFilter}
                      onChange={(e) => {
                        setDivisionFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="All">All Divisions</option>
                      {uniqueDivisions.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Owner */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FaLayerGroup size={9} /> Contract Owner
                    </label>
                    <select
                      value={ownerFilter}
                      onChange={(e) => {
                        setOwnerFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="All">All Owners</option>
                      <option value="Sub Only">Sub Only</option>
                      <option value="Remove Sub">Exclude Sub</option>
                    </select>
                  </div>

                  {/* Pending Months Threshold */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FaClock size={9} /> Min Pending Months
                    </label>
                    <select
                      value={minPendingMonths}
                      onChange={(e) => {
                        setMinPendingMonths(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value={0}>Any Months</option>
                      <option value={1}>1+ Months</option>
                      <option value={3}>3+ Months</option>
                      <option value={6}>6+ Months</option>
                      <option value={12}>12+ Months</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FaSortAmountDown size={9} /> Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="pending-desc">Pending Months: High to Low</option>
                      <option value="pending-asc">Pending Months: Low to High</option>
                      <option value="amount-desc">Amount: High to Low</option>
                      <option value="amount-asc">Amount: Low to High</option>
                      <option value="date-desc">Date: Newest First</option>
                      <option value="date-asc">Date: Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* Amount Slab & Date Range Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-500">Amount Slab:</span>
                    {[
                      { label: "All", value: "All" },
                      { label: "< ₹1L", value: "under_1L" },
                      { label: "₹1L – ₹5L", value: "1L_5L" },
                      { label: "> ₹5L", value: "above_5L" },
                    ].map((slab) => (
                      <button
                        key={slab.value}
                        onClick={() => {
                          setAmountRange(slab.value);
                          setCurrentPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                          amountRange === slab.value
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {slab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-slate-400" />
                      <span className="font-medium">From:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">To:</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Consolidated Pending Bill Details Table (Serial No, Bill No, Bill Type, Pending Months, Average Amount) */}
              <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-800">
                      Bill-Wise Pending &amp; E-Invoice Summary
                    </h2>
                    <p className="text-xs text-slate-500">
                      Showing {enrichedBills.length} matching bills • Average Pending Amount:{" "}
                      <span className="font-bold text-indigo-700 font-mono">
                        ₹ {formatCurrency(summaryStats.avgPendingAmount)}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full self-start sm:self-auto">
                    {groupedContractRows.length} Contracts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 text-slate-600 border-b border-slate-200 whitespace-nowrap">
                        <th className="px-3.5 py-3 font-bold w-16">S. No</th>
                        <th className="px-3.5 py-3 font-bold">Bill No</th>
                        <th className="px-3.5 py-3 font-bold">File No &amp; Work</th>
                        <th className="px-3.5 py-3 font-bold">Bill Type</th>
                        <th className="px-3.5 py-3 font-bold">E-Invoice Date</th>
                        <th className="px-3.5 py-3 font-bold text-center">Pending Months</th>
                        <th className="px-3.5 py-3 font-bold text-right">Bill Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {enrichedBills.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-slate-400 font-medium"
                          >
                            No bills match the current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        enrichedBills.map((item, index) => (
                          <tr
                            key={item._id || `${item.fileno}-${index}`}
                            className="hover:bg-indigo-50/30 transition-colors"
                          >
                            <td className="px-3.5 py-3 font-mono text-slate-500">
                              {index + 1}
                            </td>
                            <td className="px-3.5 py-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                              {item.billno || "N/A"}
                            </td>
                            <td className="px-3.5 py-3">
                              <div className="font-mono font-semibold text-slate-800">
                                {item.fileno || "-"}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-xs">
                                {item._contract.workname || "Contract Ledger"}
                                {item._contract.division ? ` • ${item._contract.division}` : ""}
                              </div>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${item._category.badgeClass}`}
                              >
                                {item._category.label}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                              {item._category.hasEInvoice
                                ? formatDate(item.einvoicedate)
                                : "Not Taken"}
                            </td>
                            <td className="px-3.5 py-3 text-center font-mono whitespace-nowrap">
                              {item._pendingMonths > 0 ? (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold">
                                  {item._pendingMonths}{" "}
                                  {item._pendingMonths === 1 ? "Month" : "Months"}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                              ₹ {formatCurrency(item._amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {enrichedBills.length > 0 && (
                      <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800">
                        <tr>
                          <td colSpan={6} className="px-3.5 py-3 text-right text-slate-600">
                            Average Amount (Filtered Bills):
                          </td>
                          <td className="px-3.5 py-3 text-right font-mono text-indigo-700">
                            ₹{" "}
                            {formatCurrency(
                              enrichedBills.reduce((s, b) => s + b._amount, 0) /
                                enrichedBills.length
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </section>

              {/* Contract-Grouped Compact Summary Cards */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Contract-Wise Average &amp; Pending Overview
                  </h2>
                  <span className="text-xs text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                {paginatedContractGroups.map((group) => (
                  <div
                    key={group.fileno}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                        <FaFolderOpen size={16} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            File: {group.fileno}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">
                            {group.contract.workname || "Contract Account"}
                          </h3>
                          {group.contract.division && (
                            <span className="text-xs text-slate-500">
                              ({group.contract.division})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Bills listed: <strong className="text-slate-700">{group.bills.length}</strong> •
                          Max Pending:{" "}
                          <strong className="text-orange-600">
                            {group.pendingMonths} {group.pendingMonths === 1 ? "Month" : "Months"}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:text-right font-mono">
                      <div>
                        <div className="text-[10px] uppercase font-sans font-bold text-slate-400">
                          Average Amount
                        </div>
                        <div className="text-sm font-extrabold text-indigo-700">
                          ₹ {formatCurrency(group.avgAmount)}
                        </div>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        <div className="text-[10px] uppercase font-sans font-bold text-slate-400">
                          Total Amount
                        </div>
                        <div className="text-sm font-extrabold text-slate-900">
                          ₹ {formatCurrency(group.totalAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition cursor-pointer"
                  >
                    <FaChevronLeft size={11} />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs font-medium text-slate-600">
                    Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
                    <strong className="text-slate-900">{totalPages}</strong>
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition cursor-pointer"
                  >
                    <span>Next</span>
                    <FaChevronRight size={11} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default Summary;