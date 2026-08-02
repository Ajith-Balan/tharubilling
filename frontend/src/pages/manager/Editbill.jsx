import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";

const API_BASE = import.meta.env.VITE_APP_BACKEND;

const Editbill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();

  const initialState = {
   
    customFields: {},
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newCustomKey, setNewCustomKey] = useState("");
  const [newCustomValue, setNewCustomValue] = useState("");

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  // Fetch bill details by ID
  const fetchBillDetails = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/api/v1/bills/getone-bill/${id}`);
      if (res.data) {
        const data = res.data.bill || res.data;
        
        // Ensure null values from backend fallback to empty strings
        const sanitizedData = Object.keys(data).reduce((acc, key) => {
          acc[key] = data[key] ?? "";
          return acc;
        }, {});

        setFormData({
          ...initialState,
          ...sanitizedData,
          einvoicedate: formatDateForInput(data.einvoicedate),
          billpassdt: formatDateForInput(data.billpassdt),
          billfrom: formatDateForInput(data.billfrom),
          billto: formatDateForInput(data.billto),
          customFields: data.customFields || {},
        });
      }
    } catch (error) {
      console.error("Error fetching bill details:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch bill details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBillDetails();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustomField = () => {
    const key = newCustomKey.trim();
    if (!key) {
      toast.error("Custom field name cannot be empty");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: newCustomValue,
      },
    }));

    setNewCustomKey("");
    setNewCustomValue("");
  };

  const handleCustomKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomField();
    }
  };

  const handleRemoveCustomField = (keyToRemove) => {
    setFormData((prev) => {
      const updatedCustom = { ...prev.customFields };
      delete updatedCustom[keyToRemove];
      return { ...prev, customFields: updatedCustom };
    });
  };

  // Update Bill
  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to update this bill?");
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      const res = await axios.put(
        `${API_BASE}/api/v1/bills/update-bill/${id}`,
        formData
      );
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data?.message || "Bill updated successfully");
        navigate(`/dashboard/manager/bills/${formData.fileno}`);
      } else {
        toast.error("Failed to update bill");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong while updating");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Bill
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bill? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const res = await axios.delete(`${API_BASE}/api/v1/bills/delete-bill/${id}`);
      if (res.status === 200) {
        toast.success(res.data?.message || "Bill deleted successfully");
        navigate(`/dashboard/manager/bills/${formData.fileno}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete bill");
    } finally {
      setIsDeleting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-gray-500 font-semibold text-lg">Loading bill data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Bar */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Edit Monthly Bill</h1>
              <p className="text-gray-500 mt-1">
                Update billing records for File No: <span className="font-semibold text-gray-700">{formData.fileno}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all shadow-sm disabled:bg-red-300"
              >
                {isDeleting ? "Deleting..." : "Delete Bill"}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Info & Period */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-5">
                <p className="text-blue-100 text-sm">Update file details and period duration</p>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-100 rounded-2xl p-5">
                  <div className="flex flex-col gap-2 mb-4">
                    <label className={labelClass}>File No for this bill</label>
                    <input
                      type="text"
                      name="fileno"
                      value={formData.fileno || ""}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
                      <input
                        type="date"
                        name="billfrom"
                        value={formData.billfrom || ""}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div className="hidden md:flex items-center justify-center pb-3">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow">→</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
                      <input
                        type="date"
                        name="billto"
                        value={formData.billto || ""}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Bill Details */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-5 text-gray-800 border-b pb-3">
                Bill Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className={labelClass}>E-Invoice Date</label>
                  <input type="date" name="einvoicedate" value={formData.einvoicedate || ""} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bill Pass Date</label>
                  <input type="date" name="billpassdt" value={formData.billpassdt || ""} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bill Number</label>
                  <input type="text" name="billno" value={formData.billno || ""} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cheque Number</label>
                  <input type="text" name="cheque" value={formData.cheque || ""} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" value={formData.status || "PENDING"} onChange={handleChange} className={inputClass}>
                    <option value="PENDING">PENDING</option>
                    <option value="ACCOUNTS">ACCOUNTS</option>
                    <option value="PASSED">PASSED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Amounts & Charges */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-5 text-gray-800 border-b pb-3">
                Amount & Charges Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Net Amount", name: "netamount" },
                  { label: "GST", name: "gst" },
                  { label: "Total Amount", name: "totalamount" },
                  { label: "Amount Passed", name: "amountpssd" },
                  { label: "TDS", name: "tds" },
                  { label: "TDS GST (gsttds)", name: "gsttds" },
                  { label: "Penalty", name: "penalty" },
                  { label: "Over Payment", name: "overpay" },
                  { label: "Electricity", name: "electricity" },
                  { label: "Cess", name: "cess" },
                  { label: "Building Cess", name: "building_cess" },
                  { label: "Labour Cess", name: "labour_cess" },
                  { label: "SD", name: "sd" },
                  { label: "Deposit", name: "deposit" },
                  { label: "Postage", name: "postage" },
                  { label: "Postal Charge", name: "postal_charge" },
                  { label: "CC", name: "cc" },
                  { label: "Security", name: "security" },
                  { label: "Postage Bill Copy", name: "postage_bill_copy" },
                  { label: "Welfare Cess", name: "welfare_cess" },
                  { label: "Conservency", name: "conservency" },
                  { label: "PG", name: "pg" },
                  { label: "PG Interest", name: "pg_interest" },
                  { label: "ESI", name: "esi" },
                  { label: "PF", name: "pf" },
                  { label: "ESI / PF Penalty", name: "esi_pfpenalty" },
                  { label: "Linen Loss", name: "Linen_Loss" },
                  { label: "Berth Charge", name: "berth_charge" },
                  { label: "Debit Recovery", name: "Debit_recovery" },
                  { label: "Water & Cess Charge", name: "Water_cess_charge" },
                  { label: "Low Scoring", name: "low_scoring" },
                  { label: "Material Cost R", name: "Material_cost_r" },
                  { label: "BG Late Fee", name: "BG_late_fee" },
                  { label: "ESI PF R", name: "ESI_PF_R" },
                  { label: "Short Payment", name: "short_payment" },
                  { label: "Others", name: "others" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className={labelClass}>{field.label}</label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name] ?? ""}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Fields Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-5 text-gray-800 border-b pb-3">
                Additional Custom Fields
              </h2>

              {Object.keys(formData.customFields).length > 0 && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  {Object.entries(formData.customFields).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        <strong>{key}:</strong> {val}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(key)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className={labelClass}>Field Label Name</label>
                  <input
                    type="text"
                    value={newCustomKey}
                    onChange={(e) => setNewCustomKey(e.target.value)}
                    onKeyDown={handleCustomKeyPress}
                    placeholder="e.g., Miscellaneous Tax"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Field Value</label>
                  <input
                    type="text"
                    value={newCustomValue}
                    onChange={(e) => setNewCustomValue(e.target.value)}
                    onKeyDown={handleCustomKeyPress}
                    placeholder="e.g., 500"
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-xl transition-all shadow-sm"
                >
                  + Add Field
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-xl text-white font-semibold transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Editbill;