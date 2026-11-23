import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";
import { useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import {
  FaHistory,
  FaPaperPlane,
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// Today's date helper (YYYY-MM-DD)
const todayStr = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// Currency format helper
const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

// Date format helper
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Cashbookadmin = () => {
  const [auth] = useAuth();
  const fileno = auth?.user?.fileno || "";

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state (no date field needed in composer)
  const [form, setForm] = useState({
    title: "",
    credit: "",
    debit: "",
   
  });

  const [search, setSearch] = useState("");

  // Month & Year state defaulted to current date
  const [currentDate, setCurrentDate] = useState(new Date());

  const { email } = useParams();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKENDEXP}/api/v2/bills/getsitebills/${email}`
      );

      const data = res.data.bills || res.data;
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fileno]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Filter transactions by selected Month and Year
  const selectedYear = currentDate.getFullYear();
  const selectedMonth = currentDate.getMonth();

  const monthFilteredTransactions = transactions.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getFullYear() === selectedYear &&
      itemDate.getMonth() === selectedMonth
    );
  });

  // Further filter by search input
  const filteredTransactions = monthFilteredTransactions.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculations for current selected month
  const totalCredit = monthFilteredTransactions.reduce(
    (sum, item) => sum + Number(item.credit || 0),
    0
  );
  const totalDebit = monthFilteredTransactions.reduce(
    (sum, item) => sum + Number(item.debit || 0),
    0
  );
  const balance = totalCredit - totalDebit;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

    try {
      setSubmitting(true);

      const payload = {
        fileno,
        site: auth?.user?.sitename || "",
        email: auth?.user?.email || "",
        date: todayStr(), // Automatically tags today's date
        title: form.title.trim(),
        credit: creditVal,
        debit: debitVal,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_APP_BACKENDEXP}/api/v2/bills/createbill`,
        payload
      );

      const newBill = res.data.bill || res.data;
      setTransactions((prev) => [newBill, ...prev]);

      setForm({
        title: "",
        credit: "",
        debit: "",
        site: "",
      });

      toast.success("Bill added successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to add bill");
    } finally {
      setSubmitting(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Layout title={`Cashbook - ${auth?.user?.name || "User"}`}>
    <div className="min-h-screen bg-slate-100 p-2 sm:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
        
        {/* HEADER WITH MONTH SELECTOR */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-800">Cashbook</h1>
            <p className="text-[11px] sm:text-xs text-slate-500">Name: {auth?.user?.name}</p>
          </div>

          {/* Month Switcher Controls */}
          <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-blue-600 transition"
              title="Previous Month"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <span className="font-bold text-xs sm:text-sm text-slate-800 min-w-[110px] text-center">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-blue-600 transition"
              title="Next Month"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white p-2.5 sm:p-4 rounded-xl shadow-sm">
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Credit</p>
            <h2 className="text-xs sm:text-xl font-black text-green-600 mt-0.5 truncate">
              {formatINR(totalCredit)}
            </h2>
          </div>
          <div className="bg-white p-2.5 sm:p-4 rounded-xl shadow-sm">
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Debit</p>
            <h2 className="text-xs sm:text-xl font-black text-red-600 mt-0.5 truncate">
              {formatINR(totalDebit)}
            </h2>
          </div>
          <div className="bg-blue-600 p-2.5 sm:p-4 rounded-xl shadow-sm text-white">
            <p className="text-[10px] sm:text-xs text-blue-100 font-semibold">Balance</p>
            <h2 className="text-xs sm:text-xl font-black mt-0.5 truncate">
              {formatINR(balance)}
            </h2>
          </div>
        </div>

        {/* LEDGER LIST CONTAINER */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-3 sm:p-4 space-y-3">
          <div className="flex justify-between items-center bg-slate-800 text-white p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <FaHistory />
              <span className="font-bold text-xs sm:text-sm">
                Transactions ({monthNames[selectedMonth]} {selectedYear})
              </span>
            </div>
            <span className="text-[11px] text-slate-300">
              {filteredTransactions.length} items
            </span>
          </div>

          <input
            type="text"
            placeholder="Search this month..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500"
          />

          {/* Ledger Table / List */}
          <div className="min-h-[220px] max-h-[400px] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
            {/* Table Header - Hidden on small mobile for space, visible on tablet/desktop */}
            <div className="hidden sm:grid grid-cols-5 bg-slate-50 p-2.5 text-xs font-bold text-slate-600 sticky top-0">
              <div>Date</div>
              <div>Title</div>
              <div className="text-right">Credit</div>
              <div className="text-right">Debit</div>
              <div className="text-right">Balance</div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-400 text-xs">Loading ledger...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FaMoneyBillWave className="mx-auto text-3xl mb-2 text-slate-300" />
                <p className="text-xs font-medium">No transactions found for {monthNames[selectedMonth]} {selectedYear}</p>
              </div>
            ) : (
              filteredTransactions.map((item, index) => {
                const credit = Number(item.credit || 0);
                const debit = Number(item.debit || 0);

                return (
                  <div key={item._id || index}>
                    {/* Desktop / Tablet Grid Row */}
                    <div className="hidden sm:grid grid-cols-5 p-2.5 text-xs sm:text-sm items-center hover:bg-slate-50 transition">
                      <div className="text-slate-500 font-medium">
                        {formatDate(item.date)}
                      </div>
                      <div className="text-slate-800 font-bold truncate pr-2">
                        {item.title}
                      </div>
                      <div className="text-right text-green-600 font-semibold">
                        {credit > 0 ? formatINR(credit) : "-"}
                      </div>
                      <div className="text-right text-red-600 font-semibold">
                        {debit > 0 ? formatINR(debit) : "-"}
                      </div>
                      <div className="text-right font-black text-slate-700">
                        {formatINR(credit - debit)}
                      </div>
                    </div>

                    {/* Mobile Messaging Feed Style Row */}
                    <div className="sm:hidden p-3 flex justify-between items-center hover:bg-slate-50">
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-slate-800">{item.title}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(item.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-xs ${credit > 0 ? "text-green-600" : "text-red-600"}`}>
                          {credit > 0 ? `+${formatINR(credit)}` : `-${formatINR(debit)}`}
                        </p>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                          {credit > 0 ? "Credit" : "Debit"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COMPACT MESSAGE COMPOSER FORM (No Date input needed) */}
        {auth.user.role !== 3 && (
        <form
          onSubmit={handleSubmit}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 sm:p-4 shadow-lg sm:relative sm:rounded-2xl sm:shadow-sm"
        >
          <div className="max-w-4xl mx-auto flex items-center gap-1.5 sm:gap-2">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Type transaction title..."
              required
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500"
            />

            <input
              type="number"
              name="credit"
              value={form.credit}
              onChange={handleChange}
              placeholder="₹ Cr"
              min="0"
              step="0.01"
              className="w-20 sm:w-28 border border-slate-200 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-green-500 text-green-700"
            />

            <input
              type="number"
              name="debit"
              value={form.debit}
              onChange={handleChange}
              placeholder="₹ Dr"
              min="0"
              step="0.01"
              className="w-20 sm:w-28 border border-slate-200 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-red-500 text-red-600"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-10 h-10 sm:w-auto sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition disabled:bg-slate-400 shrink-0"
              title="Send Transaction"
            >
              <FaPaperPlane className="text-xs sm:text-sm" />
              <span className="hidden sm:inline text-xs">Add</span>
            </button>
          </div>
        </form>
         )}

      </div>
    </div>
    </Layout>
  );
};

export default Cashbookadmin;