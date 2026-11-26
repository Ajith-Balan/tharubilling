import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";
import { FaArrowUpRightDots } from "react-icons/fa6";

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
  FaChevronLeft,
  FaChevronRight,
  FaWordpressSimple,
  FaRoute,
} from "react-icons/fa";

import { IoSparkles } from "react-icons/io5";

const ManagerMenu = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false); // Mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state

  const role = auth?.user?.role;

  // Lock body scroll & support Escape key when mobile drawer is open
  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Logout successfully");
    setTimeout(() => navigate("/"), 1000);
  };

  const menuItems = [
    {
      to: "/dashboard/manager",
      title: "Home",
      label: "Home",
      icon: <FaHome className="text-orange-600" />,
      exact: true,
    },
    {
      to: "/dashboard/manager/contracts",
      title: "Contracts",
      label: "Contracts",
      icon: <FaClipboardList className="text-violet-600" />,
    },
    ...(role !== 3
      ? [
          {
            to: "/dashboard/manager/createcontracts",
            title: "Create Contract",
            label: "Create Contract",
            icon: <FaUserTie className="text-yellow-600" />,
          },
        ]
      : []),
    {
      to: "/dashboard/manager/billdetails",
      title: "All Bills",
      label: "All Bills",
      icon: <FaFileInvoiceDollar className="text-blue-600" />,
    },
    ...(role !== 3
      ? [
          {
            to: "/dashboard/manager/addbills",
            title: "Add Bill",
            label: "Add Bill",
            icon: <FaFileInvoiceDollar className="text-green-600" />,
          },
        ]
      : []),
       {
      to: "/dashboard/manager/penalty",
      title: "Penalty Sheet",
      label: "Penalty Sheet",
      icon: <FaCheckCircle className="text-green-800" />,
    },
     {
      to: "/dashboard/manager/summary",
      title: "Summary",
      label: (
         <span className="flex w-full items-center justify-between gap-2">
          <span>Pending Bills</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600">
            Soon
          </span>
        </span>
      ),
      icon: <FaArrowUpRightDots  className="text-green-800" />, 
    },
    {
      to: "/dashboard/manager/allsites",
      title: "Expenses (NEW)",
      label: (
        <span className="flex w-full items-center justify-between gap-2">
          <span>Expenses</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600">
            <IoSparkles className="animate-spin text-yellow-400" />
            NEW
          </span>
        </span>
      ),
      icon: <FaFileInvoiceDollar className="text-red-500" />,
    },
   
       ...(role !== 3
      ? [
    {
      to: "/dashboard/manager/states",
      title: "State code",
      label: "State codes",
      icon: <FaRoute className="text-pink-600" />,
    },
     ]
      : []),
    ...(role !== 3
      ? [
          {
            to: "/dashboard/manager/users",
            title: "Users",
            label: "Users",
            icon: <FaUsers className="text-blue-600" />,
          },
        ]
      : []),
  ];

  const isItemActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return (
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`)
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:hidden">
        <Link to="/" className="flex items-center space-x-2">
          <img
            className="h-9 w-auto rounded-md sm:h-10"
            src="https://www.tharuandsons.in/wp-content/uploads/2023/04/logo-tagline-2.jpg"
            alt="Tharu & Sons Logo"
          />
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-xl text-red-600 transition hover:bg-red-50 focus:outline-none"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh flex-col bg-white shadow-xl transition-all duration-300 ease-in-out
        md:sticky md:top-4 md:z-20 md:h-auto md:max-h-[calc(100vh-2rem)] md:shrink-0 md:rounded-2xl md:border md:border-slate-200/80 md:shadow-sm
        ${isCollapsed ? "w-72 md:w-20 md:px-3 md:py-5" : "w-72 md:w-64 md:p-5"}
        ${menuOpen ? "translate-x-0 p-5" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Mobile Drawer Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 md:hidden">
          <h2 className="text-lg font-bold text-red-600">Manager Panel</h2>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Desktop Header & Collapse Toggle */}
        <div
          className={`mb-4 hidden items-center border-b border-slate-100 pb-3 md:flex ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <h2 className="overflow-hidden whitespace-nowrap text-lg font-bold text-red-600">
              Manager Panel
            </h2>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none"
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
          {menuItems.map((item) => {
            const active = isItemActive(item);

            return (
              <Link
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.title : ""}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  isCollapsed ? "md:justify-center" : "justify-between"
                } ${
                  active
                    ? "bg-red-50 font-semibold text-red-600 shadow-xs"
                    : "text-gray-700 hover:bg-red-50/70 hover:text-red-600"
                }`}
              >
                <div className="flex w-full items-center gap-3">
                  <span
                    className={`shrink-0 text-lg ${
                      isCollapsed ? "md:mx-auto" : ""
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span
                    className={`w-full text-sm ${
                      isCollapsed ? "md:hidden" : "block"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout pinned to bottom */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            title={isCollapsed ? "Logout" : ""}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600 ${
              isCollapsed ? "md:justify-center" : ""
            }`}
          >
            <FaSignOutAlt className="shrink-0 text-lg text-red-500" />
            <span
              className={`text-sm font-medium ${
                isCollapsed ? "md:hidden" : "block"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
};

export default ManagerMenu;