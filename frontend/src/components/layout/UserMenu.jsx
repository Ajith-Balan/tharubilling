import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";
import {
  FaHome,
  FaPlusCircle,
  FaBroadcastTower,
  FaCheckCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const UserMenu = () => {
  const [auth, setAuth] = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // Hamburger toggle

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Logged out successfully");
    setTimeout(() => navigate("/"), 1000);
  };

  const links = [
    { name: "Home", path: "/dashboard/user/", icon: <FaHome /> },
    { name: "Add Bills", path: "/dashboard/user/addbills", icon: <FaPlusCircle /> },
  ];

  return (
    <>
      {/* 🔹 Mobile Hamburger Button */}
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
          className="text-2xl text-blue-600 focus:outline-none"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* 🔹 Sidebar */}
      <aside
        className={`bg-white shadow-lg rounded-2xl p-6 fixed md:static top-0 left-0 h-full w-64 z-50 transform 
          transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <h2 className="text-2xl font-bold text-blue-600 mb-6 border-b pb-2 md:block hidden">
          Quick Links
        </h2>

        <nav className="space-y-3 mt-4">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)} // Close menu on mobile
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200
                ${location.pathname === link.path ? "bg-blue-100 font-semibold text-blue-600" : ""}`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-sm font-medium">{link.name}</span>
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 mt-4"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* 🔹 Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default UserMenu;
