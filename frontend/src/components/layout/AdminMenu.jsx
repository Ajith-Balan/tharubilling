
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";

import {
  FaHome,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaUsers,
  FaChartLine,
  FaUserTie,
  FaCheckCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { IoSparkles } from "react-icons/io5";

const ManagerMenu = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const role = auth?.user?.role;

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Logout successfully");
    setTimeout(() => navigate("/"), 1000);
  };

  const menuItems = [
    {
      to: "/dashboard/manager",
      label: "Home",
      icon: <FaHome className="text-orange-600" />,
    },
    {
      to: "/dashboard/manager/contracts",
      label: "Contracts",
      icon: <FaClipboardList className="text-violet-600" />,
    },

    // Hide Create Contract for role 3
    ...(role !== 3
      ? [
          {
            to: "/dashboard/manager/createcontracts",
            label: "Create Contract",
            icon: <FaUserTie className="text-yellow-600" />,
          },
        ]
      : []),

    {
      to: "/dashboard/manager/billdetails",
      label: "All Bills",
      icon: <FaFileInvoiceDollar className="text-blue-600" />,
    },

    // Hide Add Bill for role 3
    ...(role !== 3
      ? [
          {
            to: "/dashboard/manager/addbills",
            label: "Add Bill",
            icon: <FaFileInvoiceDollar className="text-green-600" />,
          },
        ]
      : []),

    {
      to: "/dashboard/manager/allsites",
      label: (
        <span className="flex items-center justify-between w-full gap-2">
          <span>Expenses</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600">
            <IoSparkles className="text-yellow-400 animate-spin" />
            NEW
          </span>
        </span>
      ),
      icon: <FaFileInvoiceDollar className="text-red-500" />,
    },

    {
      to: "/dashboard/manager/penalty",
      label: "Penalty Sheet",
      icon: <FaCheckCircle className="text-green-800" />,
    },
    {
      to: "/dashboard/manager/profitability",
      label: "Profitability",
      icon: <FaChartLine className="text-pink-600" />,
    },
     ...(role !== 3
      ? [
    {
      to: "/dashboard/manager/users",
      label: "Users",
      icon: <FaUsers className="text-blue-600" />,
    }
  ]
     : []),
     
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center bg-white shadow p-4">
        <Link to="/" className="flex items-center space-x-2">
          <img
            className="h-10 sm:h-12 w-auto rounded-md"
            src="https://www.tharuandsons.in/wp-content/uploads/2023/04/logo-tagline-2.jpg"
            alt="Tharu & Sons Logo"
          />
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl text-red-600 focus:outline-none"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg rounded-2xl p-6 fixed md:static top-0 left-0 h-full w-64 z-50 transform
        transition-transform duration-300 ease-in-out
        ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-2xl font-bold text-red-600 mb-6 border-b pb-2 hidden md:block">
          Manager Panel
        </h2>

        <nav className="space-y-3 mt-4">
          {menuItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}

          {/* Logout */}
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

      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
};

export default ManagerMenu;
