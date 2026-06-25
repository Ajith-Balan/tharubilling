import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import AdminMenu from "../../components/layout/AdminMenu";
import { FaEdit, FaSave, FaTrash, FaTimes, FaPlus, FaFileInvoiceDollar, FaSearch, FaFilter, FaSortAmountDown, FaFolderOpen, FaPercent, FaCoins } from "react-icons/fa";
import { toast } from "react-toastify";
import BackButton from "../../components/layout/BackButton";

const BillHistory = () => {
  const [auth] = useAuth();
  const [bills, setBills] = useState([]);
  const [contractsMap, setContractsMap] = useState({}); // Stores contract details mapped by fileno

  // Search, Filter, and Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [penaltyFilter, setPenaltyFilter] = useState("All"); // New Penalty Filter State
  const [sortBy, setSortBy] = useState("date-desc");

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

  const fetchContracts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/getcontracts`
      );
      const data = res.data.contracts || res.data || [];
      
      const mappedContracts = {};
      if (Array.isArray(data)) {
        data.forEach(c => {
          if (c.fileno) mappedContracts[c.fileno] = c;
        });
      } else if (data && data.fileno) {
        mappedContracts[data.fileno] = data;
      }
      setContractsMap(mappedContracts);
    } catch (err) {
      console.error("Error fetching contracts:", err);
    }
  };

  useEffect(() => {
    if (auth?.user) {
      fetchBills();
      fetchContracts();
    }
  }, [auth?.user]);

  // Fixed Dynamic Search Endpoint integration synced with local state 'searchQuery'
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/search/${searchQuery}`
          );
          // Update the localized bills array directly based on API return payload
          setBills(res.data.bills || res.data || []);
        } catch (err) {
          console.error("Error hitting search endpoint:", err);
        }
      } else if (auth?.user) {
        fetchBills(); // Fallback to complete list when query field gets cleared
      }
    }, 400); // 400ms Debounce Layer

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, auth?.user]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  const formatCurrency = (num) => {
    if (num === undefined || num === null || isNaN(num)) return "-";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num);
  };

  // 1. Filter and Sort global flat bill pool
  const filteredAndSortedBills = useMemo(() => {
    let result = [...bills];

    // Client-side fallback fallback search matching just in case
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((bill) =>
        (bill.billno || "").toLowerCase().includes(q) || 
        (bill.fileno || "").toLowerCase().includes(q)
      );
    }

    // Status Filtering
    if (statusFilter !== "All") {
      result = result.filter((bill) => {
        const status = bill.status || "Processing";
        return status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Penalty Percentage Filtering Logic
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
      if (sortBy === "date-desc") {
        return new Date(b.month + "-01") - new Date(a.month + "-01");
      }
      if (sortBy === "date-asc") {
        return new Date(a.month + "-01") - new Date(b.month + "-01");
      }
      if (sortBy === "amount-desc") {
        return (b.totalamount || 0) - (a.totalamount || 0);
      }
      if (sortBy === "amount-asc") {
        return (a.totalamount || 0) - (b.totalamount || 0);
      }
      return 0;
    });

    return result;
  }, [bills, searchQuery, statusFilter, penaltyFilter, sortBy]);

  // 2. Group the processed bills by contract fileno key
  const categorizedBills = useMemo(() => {
    const groups = {};
    filteredAndSortedBills.forEach((bill) => {
      const key = bill.fileno || "UNASSIGNED";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(bill);
    });
    return groups;
  }, [filteredAndSortedBills]);

  return (
    <Layout title="Bill History Categorized - Manager">
      <div className="flex flex-col bg-slate-50 min-h-screen font-sans">

        <main className="flex-1 p-6 overflow-x-hidden">
          <BackButton />

          {/* ====== INFORMATION KPIS ====== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Last Passed Bill Month</span>
              <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
                {bills.find(b => b.status === "Bill Passed")?.month || "N/A"}
              </span>
            </div> */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Pending Operations Checklist</span>
              <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                {bills.filter(b => b.status !== "Bill Passed").length} Bills Awaiting Approval
              </span>
            </div>
          </div>

          {/* ====== ACTION BAR: SEARCH, FILTER & SORT CONTROL ====== */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
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

            {/* Filter and Sort Group */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <FaPercent size={11} className="text-slate-400" />
                <select
                  className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer"
                  value={penaltyFilter}
                  onChange={(e) => setPenaltyFilter(e.target.value)}
                >
                  <option value="All">All Penalties</option>
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
                  <option value="Bill Passed">Bill Passed</option>
                  <option value="Processing">Processing</option>
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

          {/* ====== CATEGORIZED WORKBOOK BUNDLES ====== */}
          {Object.keys(categorizedBills).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <p className="text-slate-400 font-medium">No ledger accounts or bill items match your adjustments.</p>
            </div>
          ) : (
            Object.keys(categorizedBills).map((fileno) => {
              const currentContract = contractsMap[fileno] || {};
              const contractBills = categorizedBills[fileno];

              // Calculate contract totals across all filtered bills in this bundle
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
                  
                  {/* Contract Section Header Card */}
                  <div className="bg-slate-100 px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FaFolderOpen size={18} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-800">
                          {currentContract.workname || "Contract Ledger Account"}
                        </h2>
                        <p className="text-xs text-slate-500 font-mono">File No: {fileno}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full">
                        {contractBills.length} {contractBills.length === 1 ? "Bill" : "Bills Logged"}
                      </span>
                    </div>
                  </div>

                {/* Desktop Full-Field Table view for this specific contract group */}
<div className="hidden xl:block overflow-x-auto">
  <table className="min-w-full text-[11px] font-medium text-slate-700 border-collapse">
    <thead>
      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 whitespace-nowrap">
        <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">E-Invoice Date</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Bill No.</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Period From</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Period To</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Base Amount</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">GST</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Gross Total</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Cheque No / Ref</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-center font-bold">Passed Date</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold text-emerald-700">Amount Passed</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Net Received</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">TDS</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">GST TDS</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">CC Deduction</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Sec. Deposit (SD)</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold text-red-500">ESI/PF Penalty</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold text-red-600">Delay Penalty</th>
        <th className="px-2 py-2.5 border-r border-slate-200 text-right font-bold">Others</th>
        <th className="px-2 py-2.5 text-center font-bold">Status</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
      {contractBills.map((bill) => {
        const gross = Number(bill.totalamount) || 0;
        const penaltyAmt = Number(bill.penalty) || 0;
        const calculatedPercentage = gross > 0 ? ((penaltyAmt / gross) * 100).toFixed(1) : "0.0";
        const computedGst = Number(bill.gst || (gross * 0.18));

        return (
          <tr key={bill._id} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
            <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">
              {formatDate(bill.einvoicedate)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-center font-bold text-indigo-600">
              {bill.billno || "N/A"}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">
              {formatDate(bill.billfrom)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">
              {formatDate(bill.billto)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right font-semibold">
              {formatCurrency(gross)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
              {formatCurrency(computedGst)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-50/50">
              {formatCurrency(gross + computedGst)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-600 font-sans">
              {bill.cheque || "-"}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500">
              {formatDate(bill.billpassdt)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-emerald-700 font-bold bg-emerald-50/20">
              {formatCurrency(bill.amountpssd || 0)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-indigo-900 font-semibold">
              {formatCurrency(bill.netamount || 0)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
              {formatCurrency(bill.tds || 0)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
              {formatCurrency(bill.gsttds || 0)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
              {formatCurrency(bill.cc || 0)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
              {formatCurrency(bill.sd || 0)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-red-500">
              {formatCurrency(bill.esi_pfpenalty || 0)}
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-red-600 font-bold bg-red-50/10">
              {formatCurrency(penaltyAmt)} <span className="text-[9px] text-slate-400 font-sans font-normal">({calculatedPercentage}%)</span>
            </td>
            <td className="px-2 py-2 border-r border-slate-200 text-right text-slate-600">
              {formatCurrency(bill.others || 0)}
            </td>
            <td className="px-2 py-2 text-center font-sans">
              <span
                className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  bill.status === "Bill Passed"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {bill.status || "Processing"}
              </span>
            </td>
          </tr>
        );
      })}
    </tbody>

    {/* ====== EXCEL METRIC DESIGN SYSTEM FOOTER ROW ====== */}
    <tfoot className="border-t-2 border-slate-400 bg-slate-100 font-mono text-slate-900 font-bold whitespace-nowrap sticky bottom-0 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
      <tr>
        <td colSpan="4" className="px-2 py-3 border-r border-slate-300 text-center font-sans text-[10px] tracking-wider text-slate-500 uppercase">
          Total Summary
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right bg-slate-200/50">
          {formatCurrency(contractTotals.totalamount)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">
          {formatCurrency(contractTotals.gst)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-indigo-950 bg-indigo-50/80 font-extrabold">
          {formatCurrency(contractTotals.grossTotal)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-center text-slate-400">-</td>
        <td className="px-2 py-3 border-r border-slate-300 text-center text-slate-400">-</td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-emerald-800 bg-emerald-50 font-extrabold">
          {formatCurrency(contractTotals.amountpssd)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-indigo-900 bg-slate-200/40">
          {formatCurrency(contractTotals.netamount)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">
          {formatCurrency(contractTotals.tds)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">
          {formatCurrency(contractTotals.gsttds)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">
          {formatCurrency(contractTotals.cc)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">
          {formatCurrency(contractTotals.sd)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-red-700">
          {formatCurrency(contractTotals.esi_pfpenalty)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-red-700 bg-red-50/40">
          {formatCurrency(contractTotals.penalty)}
        </td>
        <td className="px-2 py-3 border-r border-slate-300 text-right text-slate-700">
          {formatCurrency(contractTotals.others)}
        </td>
        <td className="px-2 py-3 text-center text-slate-400 font-sans">-</td>
      </tr>
    </tfoot>
  </table>
</div>

                  {/* Responsive Mobile Layout Card Lists showing full details */}
                  <div className="block xl:hidden p-4 space-y-4 bg-slate-50/50">
                    {contractBills.map((bill) => {
                      const gross = Number(bill.totalamount) || 0;
                      const penaltyAmt = Number(bill.penalty) || 0;
                      const calculatedPercentage = gross > 0 ? ((penaltyAmt / gross) * 100).toFixed(1) : "0.0";
                      const computedGst = Number(bill.gst || (gross * 0.18));

                      return (
                        <div key={bill._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm font-sans text-xs">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                            <span className="font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                              Bill #{bill.billno || "N/A"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              bill.status === "Bill Passed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {bill.status || "Processing"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono">
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">E-Invoice Date:</span>
                              <span className="text-slate-800">{formatDate(bill.einvoicedate)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">Period Range:</span>
                              <span className="text-slate-700 text-[11px]">{formatDate(bill.billfrom)} to {formatDate(bill.billto)}</span>
                            </div>
                            <hr className="col-span-2 my-1 border-slate-100" />
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">Base Amount:</span>
                              <span className="font-semibold text-slate-800">₹ {formatCurrency(gross)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">GST (18%):</span>
                              <span className="text-slate-700">₹ {formatCurrency(computedGst)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">Gross Total:</span>
                              <span className="font-bold text-slate-900">₹ {formatCurrency(gross + computedGst)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">Cheque / Ref No:</span>
                              <span className="text-slate-700 font-sans">{bill.cheque || "-"}</span>
                            </div>
                            <hr className="col-span-2 my-1 border-slate-100" />
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">Passed Date:</span>
                              <span className="text-slate-700">{formatDate(bill.billpassdt)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">Amount Passed:</span>
                              <span className="font-bold text-emerald-700">₹ {formatCurrency(bill.amountpssd || 0)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">Net Received:</span>
                              <span className="font-bold text-indigo-900">₹ {formatCurrency(bill.netamount || 0)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">TDS / GST TDS:</span>
                              <span className="text-slate-700">₹ {formatCurrency(bill.tds)} / ₹ {formatCurrency(bill.gsttds)}</span>
                            </div>
                            <hr className="col-span-2 my-1 border-slate-100" />
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">CC / SD Deductions:</span>
                              <span className="text-slate-700">₹ {formatCurrency(bill.cc)} / ₹ {formatCurrency(bill.sd)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">ESI/PF Penalty:</span>
                              <span className="text-red-500">₹ {formatCurrency(bill.esi_pfpenalty)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">Delay Penalty:</span>
                              <span className="font-bold text-red-600">₹ {formatCurrency(penaltyAmt)} ({calculatedPercentage}%)</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px] block">Others:</span>
                              <span className="text-slate-700">₹ {formatCurrency(bill.others)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>


                

                </div>
                
              );
            })
          )}
        </main>
      </div>
    </Layout>
  );
};

export default BillHistory;