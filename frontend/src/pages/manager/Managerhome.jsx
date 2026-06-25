import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import AdminMenu from "../../components/layout/AdminMenu.jsx";

import moment from "moment";

const Managerhome = () => {
  const [auth] = useAuth();
  const [liveTrains, setLiveTrains] = useState([]);
  const [bills, setBills] = useState([]);
  const [completedWork, setCompletedWork] = useState([]);

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







  // Metrics
  const passedBillCount = bills.filter((b) => b.status === "Bill Passed").length;
  const pendingBillCount = bills.filter((b) => b.status !== "Bill Passed").length;
  const totalBillAmount = bills.reduce((acc, b) => acc + (b.billvalue || 0), 0);
  const netAmount = bills.reduce((acc, b) => acc + (b.netamount || 0), 0);
  const totalPenalties = bills.reduce((acc, b) => acc + (b.penalty || 0), 0);



  return (
    <Layout title="Manager Dashboard">
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
        <AdminMenu />

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {/* Greeting */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <h1 className="text-2xl font-bold text-red-600">
             {auth?.user?.name || "Manager"}!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Advanced Manager Dashboard
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <MetricCard title="Passed Bills" value={passedBillCount} color="green" />
            <MetricCard title="Pending Bills" value={pendingBillCount} color="yellow" />
            <MetricCard title="Net Amount" value={`₹ ${netAmount.toLocaleString()}`} color="green" />
            <MetricCard title="Total Bill Amount" value={`₹ ${totalBillAmount.toLocaleString()}`} color="gray" />
            <MetricCard title="Total Penalties" value={`₹ ${totalPenalties.toLocaleString()}`} color="red" />
          </div>

          {/* Search */}
       

        

          {/* Bills */}
        

          {/* Chart */}
         
        </main>
      </div>
    </Layout>
  );
};

// Metric Card
const MetricCard = ({ title, value, color }) => {
  const colors = {
    green: "text-green-700 bg-green-100",
    red: "text-red-700 bg-red-100",
    yellow: "text-yellow-700 bg-yellow-100",
    blue: "text-blue-700 bg-blue-100",
    gray: "text-gray-700 bg-gray-100",
  };
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
      <h5 className="text-gray-500 text-sm sm:text-base font-medium">{title}</h5>
      <p className={`text-lg sm:text-xl font-bold ${colors[color] || "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
};




export default Managerhome;
