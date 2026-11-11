
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";

import {
  FaHistory,
  FaPaperPlane,
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Date helper
const todayStr = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Currency format
const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

// Date format
const formatDate = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Date sorting
const getTimestamp = (date) => {
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const Dashboarduser = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();
  const fileno = auth?.user?.fileno || "";

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    credit: "",
    debit: "",
  });

  const [search, setSearch] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKENDEXP}/api/v2/bills/getsitebills/${auth?.user?.email}`
      );

      const data = res.data.bills || res.data;

      setTransactions(
        Array.isArray(data)
          ? [...data].sort(
              (a, b) => getTimestamp(a.date) - getTimestamp(b.date)
            )
          : []
      );
    } catch (error) {
      console.log(error);
      setTransactions([]);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.user?.email) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [fileno]);

  // Close profile dropdown outside click
  useEffect(() => {
    const handleOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  // Logout
const handleLogout = () => {
  setProfileOpen(false);
  setAuth({ ...auth, user: null, token: "" });
  localStorage.removeItem("auth");

  toast.success("Logout successfully");

  setTimeout(() => {
    navigate("/");
  }, 2000);
};

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const selectedYear = currentDate.getFullYear();
  const selectedMonth = currentDate.getMonth();

  // Filter month transactions
  const monthFilteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        const itemDate = new Date(item.date);

        return (
          !isNaN(itemDate.getTime()) &&
          itemDate.getFullYear() === selectedYear &&
          itemDate.getMonth() === selectedMonth
        );
      })
      .sort(
        (a, b) => getTimestamp(a.date) - getTimestamp(b.date)
      );
  }, [transactions, selectedYear, selectedMonth]);

  // Opening balance: total net balance of all transactions before this month
  const openingBalance = useMemo(() => {
    const selectedMonthStart = new Date(selectedYear, selectedMonth, 1);

    return transactions
      .filter((item) => {
        const itemDate = new Date(item.date);
        return !isNaN(itemDate.getTime()) && itemDate < selectedMonthStart;
      })
      .reduce(
        (sum, item) =>
          sum + Number(item.credit || 0) - Number(item.debit || 0),
        0
      );
  }, [transactions, selectedYear, selectedMonth]);

  // Monthly calculations (credit/debit are for the selected month only)
  const totalCredit = monthFilteredTransactions.reduce(
    (sum, item) => sum + Number(item.credit || 0),
    0
  );

  const totalDebit = monthFilteredTransactions.reduce(
    (sum, item) => sum + Number(item.debit || 0),
    0
  );

  // Closing balance carries forward as next month's opening balance
  const balance = openingBalance + totalCredit - totalDebit;

  // Calculate running balance using ALL monthly transactions first.
  // Search only hides rows; it does not change the running balance values.
  let runningBalance = openingBalance;

  const allTransactionsWithBalance = monthFilteredTransactions.map((item) => {
    runningBalance +=
      Number(item.credit || 0) - Number(item.debit || 0);

    return {
      ...item,
      runningBalance,
    };
  });

  const transactionsWithBalance = allTransactionsWithBalance.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Submit transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return toast.error("Enter transaction title");
    }

    const creditVal = Number(form.credit) || 0;
    const debitVal = Number(form.debit) || 0;

    if (creditVal === 0 && debitVal === 0) {
      return toast.error("Enter either a credit or debit amount");
    }

    if (creditVal > 0 && debitVal > 0) {
      return toast.error("Enter either Credit or Debit, not both");
    }

    try {
      setSubmitting(true);

      const payload = {
        fileno,
        site: auth?.user?.sitename,
        email: auth?.user?.email || "",
        date: todayStr(),
        title: form.title.trim(),
        credit: creditVal,
        debit: debitVal,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_APP_BACKENDEXP}/api/v2/bills/createbill`,
        payload
      );

      const newBill = res.data.bill || res.data;

      // Latest transaction stays at the bottom
      setTransactions((prev) =>
        [...prev, newBill].sort(
          (a, b) => getTimestamp(a.date) - getTimestamp(b.date)
        )
      );

      setForm({
        title: "",
        credit: "",
        debit: "",
      });

      toast.success("Bill added successfully!");

      // Move to current month
      setCurrentDate(new Date());
      setSearch("");
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to add bill"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-800 pb-44 sm:pb-32">

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-7 space-y-5">

        {/* ================= HEADER ================= */}

        <div className="relative overflow-visible bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">

          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 rounded-l-3xl" />

          <div className="flex items-center justify-between gap-3 p-4 sm:p-6">

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FaWallet className="text-lg sm:text-xl" />
                </div>

                <div>
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                    Cashbook
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Transaction Management
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-3 break-words">
                Welcome,{" "}
                <span className="font-bold text-slate-800">
                  {auth?.user?.name || "User"}
                </span>
              </p>

              {auth?.user?.sitename && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {auth.user.sitename}
                </p>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative shrink-0" ref={profileRef}>

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl px-2.5 sm:px-4 py-2.5 transition-all"
              >
                <FaUserCircle className="text-xl sm:text-2xl text-indigo-600" />

                <span className="hidden sm:block text-sm font-bold max-w-[120px] truncate">
                  {auth?.user?.name || "Account"}
                </span>

                <FaChevronDown
                  className={`text-[10px] text-slate-500 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">

                  <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
                    <div className="flex items-center gap-3">
                      <FaUserCircle className="text-3xl" />

                      <div className="min-w-0">
                        <p className="font-bold text-sm break-words">
                          {auth?.user?.name}
                        </p>

                        <p className="text-[11px] text-indigo-100 break-all">
                          {auth?.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
                    >
                      <FaSignOutAlt className="text-base" />
                      Logout
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================= MONTH SELECTOR ================= */}

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Overview
            </p>

            <h2 className="text-lg sm:text-xl font-black text-slate-800 mt-1">
              Monthly Summary
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">

            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            <div className="text-center min-w-[115px]">
              <p className="text-xs sm:text-sm font-black text-slate-800">
                {monthNames[selectedMonth]} {selectedYear}
              </p>
            </div>

            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition"
            >
              <FaChevronRight className="text-xs" />
            </button>

          </div>
        </div>

        {/* ================= SUMMARY CARDS ================= */}

        <div className="grid grid-cols-3 gap-2 sm:gap-4">

          {/* Credit */}
          <div className="relative overflow-hidden bg-white border border-green-100 rounded-2xl p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <FaArrowDown />
              </div>

              <p className="text-[10px] sm:text-sm font-bold text-slate-500">
                Credit
              </p>
            </div>

            <h3 className="text-xs sm:text-xl font-black text-green-600 break-words">
              {formatINR(totalCredit)}
            </h3>

            <p className="hidden sm:block text-[11px] text-slate-400 mt-1">
              Total received
            </p>
          </div>

          {/* Debit */}
          <div className="relative overflow-hidden bg-white border border-red-100 rounded-2xl p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <FaArrowUp />
              </div>

              <p className="text-[10px] sm:text-sm font-bold text-slate-500">
                Debit
              </p>
            </div>

            <h3 className="text-xs sm:text-xl font-black text-red-600 break-words">
              {formatINR(totalDebit)}
            </h3>

            <p className="hidden sm:block text-[11px] text-slate-400 mt-1">
              Total spent
            </p>
          </div>

          {/* Balance */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-3 sm:p-5 shadow-lg shadow-indigo-200 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/15 text-white flex items-center justify-center">
                <FaWallet />
              </div>

              <p className="text-[10px] sm:text-sm font-bold text-indigo-100">
                Closing Balance
              </p>
            </div>

            <h3 className="text-xs sm:text-xl font-black break-words">
              {formatINR(balance)}
            </h3>

            <p className="hidden sm:block text-[11px] text-indigo-100 mt-1">
              Includes opening balance
            </p>
          </div>

        </div>

        {/* ================= TRANSACTION SECTION ================= */}

        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">

          {/* Heading */}
          <div className="p-4 sm:p-5 border-b border-slate-100">

            <div className="flex items-center justify-between gap-2">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FaHistory className="text-lg" />
                </div>

                <div>
                  <h2 className="font-black text-sm sm:text-lg text-slate-800">
                    Transaction History
                  </h2>

                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                    {monthNames[selectedMonth]} {selectedYear}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50 text-indigo-700 rounded-lg px-3 py-1.5 text-xs font-black">
                {transactionsWithBalance.length} Bills
              </div>

            </div>

            {/* Search */}
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Search transactions by full title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
              />
            </div>

          </div>

          {/* Opening Balance - carried forward from previous month */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-blue-50 border-b border-blue-100">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-black text-blue-800">
                Opening Balance
              </p>
              <p className="text-[10px] sm:text-xs text-blue-600 mt-0.5">
                Previous month's closing balance
              </p>
            </div>
            <p className="text-sm sm:text-base font-black text-blue-800 whitespace-nowrap">
              {formatINR(openingBalance)}
            </p>
          </div>

          {/* Table Header - Desktop */}
          <div className="hidden sm:grid grid-cols-[125px_minmax(0,2fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(120px,1fr)] gap-3 bg-slate-50 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">

            <div>Date</div>
            <div>Transaction Details</div>
            <div className="text-right">Credit</div>
            <div className="text-right">Debit</div>
            <div className="text-right">Balance</div>

          </div>

          {/* Complete Transaction List - No fixed height or internal scrollbar */}
          <div className="divide-y divide-slate-100">

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-400 mt-4 font-medium">
                  Loading transactions...
                </p>
              </div>
            ) : transactionsWithBalance.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <FaMoneyBillWave className="text-2xl text-slate-300" />
                </div>

                <h3 className="font-bold text-slate-700">
                  No Transactions Found
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  No bills available for {monthNames[selectedMonth]} {selectedYear}.
                </p>
              </div>
            ) : (
              transactionsWithBalance.map((item, index) => {
                const credit = Number(item.credit || 0);
                const debit = Number(item.debit || 0);

                return (
                  <div
                    key={item._id || index}
                    className={`transition-colors hover:bg-slate-50 ${
                      index === transactionsWithBalance.length - 1
                        ? "bg-indigo-50/40"
                        : "bg-white"
                    }`}
                  >

                    {/* Desktop Row */}
                    <div className="hidden sm:grid grid-cols-[125px_minmax(0,2fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(120px,1fr)] gap-3 items-start px-5 py-4">

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold pt-1">
                        <FaCalendarAlt className="text-slate-300 shrink-0" />
                        {formatDate(item.date)}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 whitespace-normal break-words leading-relaxed">
                          {item.title || "Untitled Transaction"}
                        </p>

                        {index === transactionsWithBalance.length - 1 && (
                          <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
                            Latest Entry
                          </span>
                        )}
                      </div>

                      <div className="text-right text-sm font-bold text-green-600 break-words pt-1">
                        {credit > 0 ? formatINR(credit) : "-"}
                      </div>

                      <div className="text-right text-sm font-bold text-red-600 break-words pt-1">
                        {debit > 0 ? formatINR(debit) : "-"}
                      </div>

                      <div className="text-right text-sm font-black text-slate-800 break-words pt-1">
                        {formatINR(item.runningBalance)}
                      </div>

                    </div>

                    {/* Mobile Transaction Card */}
                    <div className="sm:hidden p-4">

                      <div className="flex justify-between items-start gap-3">

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className="text-[10px] font-bold text-slate-400">
                              {formatDate(item.date)}
                            </span>

                            {index === transactionsWithBalance.length - 1 && (
                              <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
                                Latest
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-bold text-slate-800 whitespace-normal break-words leading-relaxed">
                            {item.title || "Untitled Transaction"}
                          </p>

                        </div>

                        <div className="shrink-0 text-right">
                          <p className={`text-sm font-black ${
                            credit > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {credit > 0
                              ? `+${formatINR(credit)}`
                              : `-${formatINR(debit)}`}
                          </p>

                          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                            {credit > 0 ? "Credit" : "Debit"}
                          </span>
                        </div>

                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-slate-400">
                          Running Balance
                        </span>

                        <span className="text-xs font-black text-slate-700">
                          {formatINR(item.runningBalance)}
                        </span>
                      </div>

                    </div>

                  </div>
                );
              })
            )}

          </div>

          {/* Bottom Summary */}
          {!loading && (
            <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-5 py-3 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">
                Closing Balance
              </span>

              <span className="text-sm font-black text-indigo-700">
                {formatINR(balance)}
              </span>
            </div>
          )}

        </div>

      </div>

      {/* ================= FIXED BOTTOM COMPOSER ================= */}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">

        <form
          onSubmit={handleSubmit}
          className="max-w-6xl mx-auto p-3 sm:p-4"
        >

          {/* Composer Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FaPaperPlane className="text-xs" />
              </div>

              <span className="text-xs sm:text-sm font-black text-slate-800">
                New Transaction
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-400">
              {todayStr()}
            </span>
          </div>

          {/* Desktop Composer */}
          <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_150px_150px_auto] gap-3">

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter complete transaction title..."
              required
              className="min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition"
            />

            <input
              type="number"
              name="credit"
              value={form.credit}
              onChange={handleChange}
              placeholder="Credit ₹"
              min="0"
              step="0.01"
              className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-3 text-sm font-bold text-green-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50"
            />

            <input
              type="number"
              name="debit"
              value={form.debit}
              onChange={handleChange}
              placeholder="Debit ₹"
              min="0"
              step="0.01"
              className="w-full bg-red-50/50 border border-red-200 rounded-xl px-3 py-3 text-sm font-bold text-red-600 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50"
            />

            <button
              type="submit"
              disabled={submitting}
              className="px-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black flex items-center justify-center  gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
            >
              <FaPaperPlane />
              {submitting ? "Adding..." : ""}
            </button>

          </div>

          {/* Mobile Composer */}
          <div className="sm:hidden space-y-2">

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Type transaction title..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
            />

            <div className="grid grid-cols-[1fr_1fr_48px] gap-2">

              <input
                type="number"
                name="credit"
                value={form.credit}
                onChange={handleChange}
                placeholder="Credit ₹"
                min="0"
                step="0.01"
                className="min-w-0 w-full bg-green-50 border border-green-200 rounded-xl px-2.5 py-3 text-sm font-bold text-green-700 outline-none focus:border-green-500"
              />

              <input
                type="number"
                name="debit"
                value={form.debit}
                onChange={handleChange}
                placeholder="Debit ₹"
                min="0"
                step="0.01"
                className="min-w-0 w-full bg-red-50 border border-red-200 rounded-xl px-2.5 py-3 text-sm font-bold text-red-600 outline-none focus:border-red-500"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-200 transition disabled:opacity-50"
                title="Add Transaction"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaPaperPlane className="text-sm" />
                )}
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
};

export default Dashboarduser;
