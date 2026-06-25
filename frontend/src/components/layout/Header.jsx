import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";

const Header = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block w-full bg-white shadow-md left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                className="h-10 sm:h-12 w-auto rounded-md"
                src="https://www.tharuandsons.in/wp-content/uploads/2023/04/logo-tagline-2.jpg"
                alt="Tharu & Sons Logo"
              />
            </Link>

            {/* Desktop Contact Info */}
            <div className="hidden lg:flex items-center space-x-6 text-gray-800 text-sm">
              <div className="flex items-center space-x-2">
                <FaPhoneAlt className="text-teal-400" />
                <span>+91 907421 5454</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-teal-400" />
                <span>info@tharuandsons.in</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {["Home", "About" ].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="text-gray-800 hover:text-teal-400 transition text-sm font-medium"
                >
                  {item}
                </Link>
              ))}

              {!auth.user ? (
                <>
                 
           
                </>
              ) : (
                <>
                  <Link to="/dashboard/user" className="text-gray-800 text-sm">
                    {auth.user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-800 hover:text-red-400 text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Login Button */}
      {!auth.user && (
        <div className="md:hidden fixed top-0 right-0 bg-teal-500 text-white py-2 px-4 rounded-bl-lg shadow-md z-50">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium hover:bg-teal-600 px-2 py-1 rounded transition"
          >
            Login
          </button>
        </div>
      )}
    </>
  );
};

export default Header;
