import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/Auth";

const Managerlogin = () => {
  const [formData, setFormData] = useState({
    fileno: "",
    password: "",
  });

  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (auth?.user) {
        const dashboardPath =
  res.data.user.role === 0
    ? "/dashboard/user"
    : "/";

      navigate(dashboardPath);
    }
  }, [auth, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/managerlogin`,
        formData
      );

      if (res.status === 200) {
        toast.success("Login successfully");

        const authData = {
          user: res.data.user,
          token: res.data.token,
        };

        setAuth(authData);
        localStorage.setItem("auth", JSON.stringify(authData));

       const dashboardPath =
  res.data.user.role === 0
    ? "/dashboard/user"
    : "/";

        navigate(dashboardPath);
      } else {
        toast.error(res.data.msg || "Login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.msg || "Something went wrong"
      );
    }
  };

  return (
    <Layout title={"Login - Tharu & Sons"}>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-8">
            Manager Login
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fileno" className="block text-sm font-medium text-gray-700 mb-1"
              >
                File Number
              </label>
              <input
                type="text"
                name="fileno"
                id="fileno"
                placeholder="Enter your file number"
                required
                value={formData.fileno}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Sign In
            </button>

        
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Managerlogin;