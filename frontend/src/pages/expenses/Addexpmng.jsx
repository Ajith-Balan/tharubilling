
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { FaSearch, FaChevronDown, FaCheck, FaFileContract } from "react-icons/fa";

const Addexpmng = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [showContracts, setShowContracts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dropdownRef = useRef(null);

  const [states, setStates] = useState([]);
const [districts, setDistricts] = useState([]);
const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    district: "",
    state: "",
    sitename: "",
    fileno: "",
    password: "",
  });



  // Fetch contracts
  const fetchContracts = async () => {
    try {
      setIsLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/getcontracts`
      );

      const sortedContracts = (res.data.contracts || []).sort(
        (a, b) =>
          parseInt(b.fileno?.replace(/\D/g, "") || "0", 10) -
          parseInt(a.fileno?.replace(/\D/g, "") || "0", 10)
      );

      setContracts(sortedContracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("Failed to load contracts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowContracts(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Select contract
  const handleSelectContract = (contract) => {
    setFormData((prev) => ({
      ...prev,
      fileno: contract.fileno || "",
      state: contract.state || prev.state,
      district: contract.district || prev.district,
    }));

    setSearchTerm(contract.fileno || "");
    setShowContracts(false);
  };

  const filteredContracts = contracts.filter((contract) => {
    const search = searchTerm.toLowerCase();

    return (
      contract.fileno?.toLowerCase().includes(search) ||
      contract.workname?.toLowerCase().includes(search) ||
      contract.division?.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
  const fetchStates = async () => {
    try {
      const res = await axios.get(
        "https://india-lgd-index-api.vercel.app/v1/states"
      );

      setStates(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load states");
    }
  };

  fetchStates();
}, []);

const handleStateChange = async (e) => {
  const selectedState = states.find(
    (state) => String(state.code) === e.target.value
  );

  setFormData((prev) => ({
    ...prev,
    state: selectedState?.name || "",
    district: "",
  }));

  setDistricts([]);

  if (!selectedState) return;

  try {
    setLoadingDistricts(true);

    const res = await axios.get(
      `https://india-lgd-index-api.vercel.app/v1/districts?state=${selectedState.code}`
    );

    setDistricts(res.data.data || []);
  } catch (error) {
    toast.error("Failed to load districts");
  } finally {
    setLoadingDistricts(false);
  }
};

  const validateForm = () => {
    const { sitename,name, password, fileno, email, phone } = formData;

    if (!sitename || !name || !password || !fileno || !email || !phone) {
      toast.error("Please fill all required fields");
      return false;
    }

    return true;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_BACKENDEXP}/api/v2/expenses/createsite`,
        formData
      );

      if (res.status === 201) {
        toast.success("Registered successfully");

        setFormData({
          email: "",
          name: "",
          phone: "",
          district: "",
          state: "",
          fileno: "",
          password: "",
          sitename: "",
        });

        setSearchTerm("");
      } else if (res.status === 200) {
        toast.error("Already registered, please login");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error during registration"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-700/20 focus:border-yellow-800 transition text-sm bg-white";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-3 sm:px-6">

      <main className="max-w-4xl mx-auto">

        <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-yellow-950 px-6 py-7 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <FaFileContract size={22} />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Add Expense Manager
                </h2>
                <p className="text-yellow-100/70 text-xs mt-1">
                  Register a new expense manager for a contract
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8">

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800">
                Contract Information
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Select the contract for this expense manager.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* File No Dropdown */}
              <div className="relative md:col-span-2" ref={dropdownRef}>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select File No <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                  <input
                    type="text"
                    placeholder="Click here to select or search contract..."
                    value={showContracts ? searchTerm : formData.fileno}
                    onFocus={() => {
                      setShowContracts(true);
                      setSearchTerm(formData.fileno);
                    }}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowContracts(true);
                      setFormData((prev) => ({
                        ...prev,
                        fileno: "",
                      }));
                    }}
                    className={`${inputClass} pl-11 pr-11`}
                    required
                  />

                  <FaChevronDown
                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${
                      showContracts ? "rotate-180" : ""
                    }`}
                  />

                </div>

                {/* Dropdown */}
                {showContracts && (
                  <div className="absolute z-50 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">

                    <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-600">
                        AVAILABLE CONTRACTS
                      </span>

                      <span className="text-xs text-gray-400">
                        {filteredContracts.length} Contracts
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto">

                      {isLoading ? (
                        <div className="p-8 text-center text-sm text-gray-400">
                          Loading contracts...
                        </div>
                      ) : filteredContracts.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-400">
                          No contracts found
                        </div>
                      ) : (
                        filteredContracts.map((contract, index) => (
                          <button
                            key={contract._id || contract.fileno || index}
                            type="button"
                            onClick={() => handleSelectContract(contract)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-yellow-50 transition flex items-center justify-between ${
                              formData.fileno === contract.fileno
                                ? "bg-yellow-50"
                                : ""
                            }`}
                          >
                            <div className="min-w-0">

                              <p className="font-bold text-sm text-gray-800">
                                {contract.fileno}
                              </p>

                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {contract.workname ||  "No contract name"}
                              </p>

                            
                                <p className="text-[11px] text-gray-400 mt-1">
                                  {contract.nameofthework}
                                </p>
                            

                            </div>

                            {formData.fileno === contract.fileno && (
                              <FaCheck className="text-yellow-800 shrink-0" />
                            )}

                          </button>
                        ))
                      )}

                    </div>
                  </div>
                )}

                {formData.fileno && (
                  <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                    <FaCheck />
                    Selected: {formData.fileno}
                  </p>
                )}

              </div>

              {/* Site */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contract / Site Name
                </label>

                <input
                  type="text"
                  name="sitename"
                  placeholder="Site name"
                  value={formData.sitename}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* State */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    State *
  </label>

  <select
    value={
      states.find((s) => s.name === formData.state)?.code || ""
    }
    onChange={handleStateChange}
    required
    className={inputClass}
  >
    <option value="">Select State</option>

    {states.map((state) => (
      <option key={state.code} value={state.code}>
        {state.name}
      </option>
    ))}
  </select>
</div>

{/* District */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    District *
  </label>

  <select
    name="district"
    value={formData.district}
    onChange={handleChange}
    disabled={!formData.state || loadingDistricts}
    required
    className={inputClass}
  >
    <option value="">
      {loadingDistricts ? "Loading districts..." : "Select District"}
    </option>

    {districts.map((district) => (
      <option key={district.code} value={district.name}>
        {district.name}
      </option>
    ))}
  </select>
</div>

            </div>

            {/* Manager Details */}
            <div className="mt-9 mb-6">
              <h3 className="text-sm font-bold text-gray-800">
                Expense Manager Details
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Enter the manager's personal and login information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Manager Name *
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Manager name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Manager email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="10 digit phone number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

            </div>

            {/* Submit */}
            <div className="mt-9 pt-6 border-t border-gray-100">

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-950 hover:bg-gray-900 active:scale-[0.99]"
                }`}
              >
                {isSubmitting
                  ? "Registering..."
                  : "Add Expense Manager"}
              </button>

            </div>

          </form>
        </div>

      </main>
    </div>
  );
};

export default Addexpmng;
