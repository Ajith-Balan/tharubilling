import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import AdminMenu from "../../components/layout/AdminMenu.jsx";
import { 
  FaClipboardList, 
  FaUserTie, 
  FaFileInvoiceDollar,
  FaChartLine 
} from "react-icons/fa"; 

const Managerhome = () => {
  const [auth] = useAuth();
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.user) {
      fetchBills();
    }
  }, [auth?.user]);

  const fetchBills = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/getbills`
      );
      const sortedBills = (res.data.bills || []).sort(
        (a, b) => new Date(b.month + "-01") - new Date(a.month + "-01")
      );
      setBills(sortedBills);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  return (
    <Layout title="Manager Dashboard">
      <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminMenu />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {/* Greeting */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-2 border-b border-gray-200 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome back, <span className="text-red-600">{auth?.user?.name || "Manager"}</span>!
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                Here's what's happening with your projects today.
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full shadow-sm">
              Advanced Control Panel
            </span>
          </div>

          {/* Animated Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            {/* View Cards */}
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

            {/* Placeholder for Profitability (Update route as needed) */}
            <DashboardCard 
              title="Profitability" 
              subtitle="Real-time margin analysis"
              icon={<FaChartLine className="w-6 h-6 text-purple-600" />}
              gradient="from-purple-500/10 to-pink-500/5"
              borderColor="hover:border-purple-500"
              onClick={() => navigate("/dashboard/manager/profitability")} 
            />

            {/* Action/Add Cards */}
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
              
          </div>
        </main>
      </div>
    </Layout>
  );
};

// Reusable Animated Card Component
const DashboardCard = ({ title, subtitle, icon, gradient, borderColor, isAction = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm 
      transition-all duration-300 ease-out cursor-pointer transform hover:-translate-y-1 hover:shadow-xl ${borderColor}`}
    >
      {/* Background Animated Gradient Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-4">
          {/* Icon Container */}
          <div className="p-3 bg-gray-50 group-hover:bg-white rounded-xl transition-colors duration-300 shadow-inner group-hover:shadow-sm">
            {icon}
          </div>
          
          {/* Arrow Indicator */}
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
        </div>
      </div>
    </div>
  );
};

export default Managerhome;