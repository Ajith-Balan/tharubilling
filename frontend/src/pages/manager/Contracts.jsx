import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import AdminMenu from "../../components/layout/AdminMenu";
import { toast } from "react-toastify";
import { FaFileInvoiceDollar, FaBars, FaTimes, FaSearch, FaFilter, FaSortAmountDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/layout/BackButton";
const Contracts = () => {
  const [auth] = useAuth();
  const [contracts, setContracts] = useState([]);
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();
  // const [showMenu, setShowMenu] = useState(true);

  // Search, Filter, & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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
      setContracts(res.data.contracts || []);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      toast.error("Failed to load contracts");
    }finally {
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
          setCurrentPage(1); // Reset to page 1 on new search query
        } catch (err) {
          console.error("Error hitting search endpoint:", err);
          // Fallback to primary list if search route fails locally
        }
      } else if (auth?.user) {
        fetchContracts();
      }
    }, 400); // 400ms Debounce layer to optimize network API calls

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
  const matchedBills = bills.filter((bill) => contractPeriods.includes(bill.fileno));

  // 1. Apply Filtering Matrix
  const filteredContracts = contracts.filter((contract) => {
    // Dropdown Status Filter
    if (statusFilter !== "All" && contract.status?.toLowerCase() !== statusFilter.toLowerCase()) {
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
    if (sortBy === "date-desc") return new Date(b.startdate || 0) - new Date(a.startdate || 0);
    if (sortBy === "date-asc") return new Date(a.startdate || 0) - new Date(b.startdate || 0);
    if (sortBy === "value-desc") return (Number(b.contractvalue) || 0) - (Number(a.contractvalue) || 0);
    if (sortBy === "value-asc") return (Number(a.contractvalue) || 0) - (Number(b.contractvalue) || 0);
    return 0;
  });

  // 3. Apply Pagination Math Engine
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedContracts = sortedContracts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedContracts.length / itemsPerPage);


  if (loading) {
  return (
    <Layout>
      <div className="p-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-64 mb-6"></div>

        <div className="bg-white rounded-xl shadow p-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-200 rounded mb-3"
            ></div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
  return (
    <Layout title="Contract & Bill Management - Manager">
      <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">

          {/* <AdminMenu /> */}
       
        <main className="flex-1 p-4 lg:p-6">
          <BackButton  />
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Contract Dashboard</h1>
          </div>

          {/* Action Row: Search, Filter & Sort */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            {/* Functional Search input */}
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

            {/* Status Filter Dropdown */}
            <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-sm px-3 py-1.5">
              <FaFilter className="text-slate-500 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer pr-2 text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-sm px-3 py-1.5">
              <FaSortAmountDown className="text-slate-500 mr-2" />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
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
            <h2 className="text-xl font-bold text-gray-700">Active Contracts</h2>
            <span className="text-sm text-gray-500">
              Showing {sortedContracts.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, sortedContracts.length)} of {sortedContracts.length}
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
                      <th className="px-4 py-3 text-left font-semibold border-r">File No</th>
                      
                      <th className="px-4 py-3 text-left font-semibold border-r">Division</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Name of Work</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Contract Number</th>

                      <th className="px-4 py-3 text-left font-semibold border-r">Contract Value</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Penalty</th>
                     <th className="px-4 py-3 text-left font-semibold border-r">Started On</th>

                      <th className="px-4 py-3 text-left font-semibold border-r">Validity / End Date</th>
                      <th className="px-4 py-3 text-left font-semibold border-r">Extension Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentDisplayedContracts.map((contract) => (
                      <tr 
                        key={contract._id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/dashboard/manager/bills/${contract.fileno}`)}
                      >
                        <td className="px-4 py-3 border-r font-semibold text-purple-700">{contract.fileno || "N/A"}</td>
                     
                        <td className="px-4 py-3 font-medium border-r">{contract.division || "N/A"}</td>
                        <td className="px-4 py-3 border-r capitalize">{contract.workname || "N/A"}</td>
                        <td className="px-4 py-3 border-r">{contract.contractNumber || "N/A"}</td>
                        <td className="px-4 py-3 border-r">₹{Number(contract.contractvalue || 0).toLocaleString("en-IN")}</td>
                        <td className="px-2 py-2 border-r">
                          {(() => {
                            const contractValue = Number(contract.contractvalue || 0);
                            const bill = matchedBills.find((b) => b.fileno === contract.fileno);
                            const penalty = Number(bill?.penalty || 0);
                            const maxPenalty = contractValue * 0.1;
                            const percentage = contractValue > 0 ? ((penalty / contractValue) * 100).toFixed(1) : 0;
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

                           <td className="px-4 py-3 border-r whitespace-nowrap text-center font-semibold text-purple-700">{formatDate(contract.startdate) || "N/A"}</td>
                        <td className="px-4 py-3 border-r">
                          {(() => {
                            const billAmount = matchedBills
                              .filter((bill) => bill.fileno === contract.fileno)
                              .reduce((sum, bill) => sum + (Number(bill.totalamount) || 0), 0);

                            // if (!billAmount || !contract.contractvalue) return "N/A";
                            const percentage = getCompletionPercentage(billAmount, contract.contractvalue);
                            let color = "bg-red-500";
                            if (percentage < 25) color = "bg-green-500";
                            else if (percentage < 50) color = "bg-yellow-500";
                            else if (percentage < 75) color = "bg-orange-500";

                            return (
                              <div className="min-w-[180px]" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="font-medium">{formatDate(contract.enddate)}</span>
                                  <span className="font-semibold">{percentage}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                                </div>
                                <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  ₹{billAmount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            );
                          })()}
                        </td> 
                        <td className="px-4 py-3  whitespace-nowrap text-center  border-r">{contract.extension ? formatDate(contract.extension) : "-"}</td>
                        <td
                          className={`px-4 py-3 text-center font-bold ${
                            contract.status === "Active"
                              ? "bg-green-300 text-green-900"
                              : contract.status === "Completed"
                              ? "bg-blue-300 text-blue-900"
                              : contract.status === "Closed"
                              ? "bg-red-300 text-red-900"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
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
                    onClick={() => navigate(`/dashboard/manager/bills/${contract.fileno}`)}
                  >
                    <h3 className="font-bold text-purple-700 mb-2">{contract.fileno || "N/A"}</h3>
                    <p><span className="font-semibold">Division:</span> {contract.division || "N/A"}</p>
                    <p><span className="font-semibold">Work:</span> {contract.workname || "N/A"}</p>
                    <p><span className="font-semibold">Contract No:</span> {contract.contractNumber || "N/A"}</p>
                    <p><span className="font-semibold">Value:</span> ₹{Number(contract.contractvalue || 0).toLocaleString("en-IN")}</p>
                    <p><span className="font-semibold">Status:</span> {contract.status || "N/A"}</p>
                  </div>
                ))}
              </div>

              {/* Functional Pagination Pagination Dashboard Layout Component */}
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