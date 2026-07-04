import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";
import axios from "axios";
import {
  FaHome,
  FaFileInvoiceDollar,
  FaUserPlus,
  FaClipboardList,
  FaUsers,
  
  FaUserTie,
  FaBroadcastTower,
  FaCheckCircle,
  FaTrain,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { BsChatText } from "react-icons/bs";

const ManagerMenu = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Logout successfully");
    setTimeout(() => navigate("/"), 1000);
  };

  // Fetch chats
  const fetchChats = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/chat/getchats`
      );
      let allChats = res.data.chats || res.data.chat || [];
      allChats = allChats.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      const today = new Date().toISOString().split("T")[0];
      const todayChats = allChats.filter(
        (chat) =>
          new Date(chat.createdAt).toISOString().split("T")[0] === today &&
          chat.user !== auth?.user?.name
      );
      setTodayCount(todayChats.length);
      setChats(allChats);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const menuItems = [
    { to: "/dashboard/manager", label: "Home", icon: <FaHome /> },

    { to: "/dashboard/manager/contracts", label: "Contracts", icon: <FaClipboardList /> },

  
    { to: "/dashboard/manager/createcontracts", label: "Create Contract", icon: <FaUserTie /> },
     { to: "/dashboard/manager/billdetails", label: "All Bills", icon: <FaFileInvoiceDollar /> },
     { to: "/dashboard/manager/addbills", label: "Add Bill", icon: <FaFileInvoiceDollar /> },

     

  ];

  return (
    <>
      {/* 🔹 Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center bg-white shadow p-4">
  <Link to="/" className="flex items-center space-x-2">
            <img
              className="h-10 sm:h-12 w-auto rounded-md"
              src="https://www.tharuandsons.in/wp-content/uploads/2023/04/logo-tagline-2.jpg"
              alt="Tharu & Sons Logo"
            />
          </Link>        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl text-red-600 focus:outline-none"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* 🔹 Sidebar (Desktop + Tablet) */}
      <aside
        className={`bg-white shadow-lg rounded-2xl p-6 fixed md:static top-0 left-0 h-full w-64 z-50 transform 
        transition-transform duration-300 ease-in-out 
        ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <h2 className="text-2xl font-bold text-red-600 mb-6 border-b pb-2 md:block hidden">
          Quick Links
        </h2>

        <nav className="space-y-3 mt-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              onClick={() => setMenuOpen(false)} // Close menu on mobile tap
              className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>

              {item.label === "Connect" && todayCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {todayCount}
                </span>
              )}
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* 🔹 Background Overlay (when mobile menu is open) */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default ManagerMenu;
