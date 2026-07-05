import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import AdminMenu from "../../components/layout/AdminMenu.jsx";
import { 
  FaClipboardList, 
  FaUserTie, 
  FaFileInvoiceDollar,
  FaChartLine,
  FaBell 
} from "react-icons/fa"; 

const Managerhome = () => {
  const [auth] = useAuth();
  const [bills, setBills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.user) {
      fetchDashboardData();
    }
  }, [auth?.user]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fast string re-ordering for YYYY-MM-DD to DD-MM-YYYY layout
  const convertYmdToDmy = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("-")) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Bills
      const billsRes = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/getbills`
      );
      const allBills = billsRes.data.bills || [];
      
      const sortedBills = [...allBills].sort(
        (a, b) => new Date(b.month + "-01") - new Date(a.month + "-01")
      );
      setBills(sortedBills);

      // 2. Fetch Contracts
      const contractsRes = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/getcontracts`
      );
      const contracts = contractsRes.data.contracts || [];

      // 3. Generate strict absolute "Today" comparison matching YYYY-MM-DD
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const todaysNotifications = allBills
        .filter(bill => bill.billpassdt === todayStr)
        .map(bill => {
          const matchingContract = contracts.find(c => c.fileno === bill.fileno);
          
          const workName = matchingContract?.workname || `Contract (${bill.fileno})`;
          const displayFrom = convertYmdToDmy(bill.billfrom);
          const displayTo = convertYmdToDmy(bill.billto);
          const displayPassedAmt = Number(bill.amountpssd || 0).toLocaleString('en-IN');

          return {
            id: bill._id,
            passedDateDisplay: convertYmdToDmy(bill.billpassdt),
            message: `The bill for "${workName}" covering the period from ${displayFrom} to ${displayTo} has been processed. The approved amount passed is ₹${displayPassedAmt}.`
          };
        });

      setNotifications(todaysNotifications);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  return (
    <Layout title="Manager Dashboard">
      <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminMenu />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {/* Greeting Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-200 pb-5 relative">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome back, <span className="text-red-600">{auth?.user?.name || "Manager"}</span>!
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                Here's what's happening with your projects today.
              </p>
            </div>
            
            <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
              {/* Notification Bell Component */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-red-600 hover:border-red-200 shadow-sm transition-all relative focus:outline-none"
                >
                  <FaBell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Today</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-4 hover:bg-gray-50/80 transition-colors">
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                              {notif.message}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 inline-block">
                              Passed on: {notif.passedDateDisplay}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-400 text-sm">
                          No new bill updates for today.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full shadow-sm whitespace-nowrap">
                Advanced Control Panel
              </span>
            </div>
          </div>

          {/* Animated Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard 
              title="Contracts" 
              subtitle="Manage and track active agreements"
              icon={<FaClipboardList className="w-6 h-6 text-blue-600" />}
              gradient="from-blue-500/10 to-indigo-500/5"
              borderColor="hover:border-blue-500"
              onClick={() => navigate("/dashboard/manager/contracts")}
            />

            <DashboardCard 
              title="All Bills" 
              subtitle={`${bills.length} total bills recorded`}
              icon={<FaFileInvoiceDollar className="w-6 h-6 text-emerald-600" />}
              gradient="from-emerald-500/10 to-teal-500/5"
              borderColor="hover:border-emerald-500"
              onClick={() => navigate("/dashboard/manager/billdetails")}
            />

            <DashboardCard 
              title="Create Contract" 
              subtitle="Draft and assign a new contract"
              icon={<FaUserTie className="w-6 h-6 text-amber-600" />}
              gradient="from-amber-500/10 to-orange-500/5"
              borderColor="hover:border-amber-500"
              isAction={true}
              onClick={() => navigate("/dashboard/manager/createcontracts")}
            />

            <DashboardCard 
              title="Add Bill" 
              subtitle="Generate a new statement of expense"
              icon={<FaFileInvoiceDollar className="w-6 h-6 text-rose-600" />}
              gradient="from-rose-500/10 to-red-500/5"
              borderColor="hover:border-rose-500"
              isAction={true}
              onClick={() => navigate("/dashboard/manager/addbills")}
            />  

            <DashboardCard 
              title="Profitability" 
              subtitle="Real-time margin analysis"
              content="Coming Soon"
              icon={<FaChartLine className="w-6 h-6 text-purple-600" />}
              gradient="from-purple-500/10 to-pink-500/5"
              borderColor="hover:border-purple-500"
              onClick={() => navigate("/dashboard/manager/profitability")} 
            />
          </div>
        </main>
      </div>
    </Layout>
  );
};

const DashboardCard = ({ title, subtitle, icon, gradient, content, borderColor, isAction = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm 
      transition-all duration-300 ease-out cursor-pointer transform hover:-translate-y-1 hover:shadow-xl ${borderColor}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-gray-50 group-hover:bg-white rounded-xl transition-colors duration-300 shadow-inner group-hover:shadow-sm">
            {icon}
          </div>
          <span className="text-gray-400 group-hover:text-gray-900 transition-colors duration-300 transform group-hover:translate-x-1">
            {isAction ? "＋" : "→"}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>
          {content && (
            <div className="mt-4">
              <p className="text-md text-gray-600">
                {content}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Managerhome;