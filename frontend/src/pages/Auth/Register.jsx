import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingIfsc, setLoadingIfsc] = useState(false);
  const [ifscError, setIfscError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: 1,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  

  const validateForm = () => {
    const { name,  password, confirmPassword } = formData;
    if (!name || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return false;
    }
 
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/auth/register`,
        formData
      );
      if (res.status === 201) toast.success("Registered successfully");
      else if (res.status === 200)
        toast.error("Already registered, please login");
      else toast.error("Registration failed");
    } catch (error) {
      toast.error("Error during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title=" Add Admin">
      <div className="flex flex- md:flex-row bg-gray-100 min-h-screen">
     

        {/* 🔹 Main Form */}
        <main className="flex-1 px-4 sm:px-6  mt-5 lg:px-8">
          <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-yellow-900">
              Add Admin
            </h2>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              onSubmit={handleSubmit}
            >
        

              {/* Name */}
              <div>
                <label className="text-gray-700 mb-2 text-sm font-medium">
                  Admin Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Admin Name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-800 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-gray-700 mb-2 text-sm font-medium">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Supervisor Email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-800 text-sm"
                />
              </div>


              {/* Password */}
              <div>
                <label className="text-gray-700 mb-2 text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-800 text-sm"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-gray-700 mb-2 text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-800 text-sm"
                />
              </div>


              {/* Submit Button */}
              <div className="md:col-span-2 text-center mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-6 py-2 text-white rounded-md text-sm font-medium transition ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-yellow-900 hover:bg-gray-900"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Register;
