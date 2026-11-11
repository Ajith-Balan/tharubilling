import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/Auth";

const Explogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if auth is present
  // if (auth.user)
  // useEffect(() => {

  //       setAuth({ ...auth, user: null, token: '' });
  //       localStorage.removeItem('auth');
  //       toast.success('Logout successfully');

    
  // }, []);

    // Redirect if auth is present
  if (auth.user.role === 2) {
    navigate("/dashboard/exp/" );
  } 
  
 


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_BACKENDEXP}/api/v2/expenses/expenseslogin`,
        formData
      );

      if (res.status === 200) {
        toast.success("Login successfully");
        setAuth({
          ...auth,
          user: res.data.user,
          token: res.data.token,
        });
        localStorage.setItem("auth", JSON.stringify(res.data));

        // Redirect after successful login
        const dashboardPath = 
        res.data.user.role === 2 
                ? "/dashboard/exp/"
                : "/";
            navigate( dashboardPath);
      } else {
        toast.error(res.data.msg || "Login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div>
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8"> Login</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Sign in
              </button>
              <div className="flex justify-between">
                {/* <Link className="text-blue-500 underline" to={"/forget"}>
                  Forgot Password
                </Link> */}
                {/* <p>
                  New user?{" "}
                  <Link className="text-blue-600 j underline" to={"/register"}>
                    Sign up
                  </Link>
                </p> */}
              </div>
            </form>
          </div>
        </div>
    </div>
  );
};

export default Explogin;
