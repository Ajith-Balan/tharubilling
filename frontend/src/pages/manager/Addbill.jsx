import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";
import * as XLSX from "xlsx";

const Addbill = () => {
  const [auth] = useAuth();

  const initialState = {
   
    customFields: {},
  };

  const [contract, setContract] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);

  const [newCustomKey, setNewCustomKey] = useState("");
  const [newCustomValue, setNewCustomValue] = useState("");

  const handleAddCustomField = () => {
    if (!newCustomKey.trim()) {
      toast.error("Custom field name cannot be empty");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [newCustomKey.trim()]: newCustomValue,
      },
    }));

    setNewCustomKey("");
    setNewCustomValue("");
  };

  const handleRemoveCustomField = (keyToRemove) => {
    setFormData((prev) => {
      const updatedCustom = { ...prev.customFields };
      delete updatedCustom[keyToRemove];
      return { ...prev, customFields: updatedCustom };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchContract = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/get-contract-by-fileno/${formData.fileno || auth?.user?.fileno}`
      );
      const contractData = Array.isArray(res.data) ? res.data[0] : res.data;
      setContract(contractData || {});
    } catch (err) {
      console.error("Error fetching contract:", err);
    }
  };

  useEffect(() => {
    if (auth?.user) {
      fetchContract();
    }
  }, [auth?.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to add this bill?");
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/createbill`,
        formData
      );
      if (res.status === 201) {
        toast.success("Bill added successfully");
        setFormData(initialState);
      } else {
        toast.error("Failed to add bill");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const templateData = [
        {
          fileno: "FILENO123",
          einvoicedate: "2026-06-23",
          billno: "BILL-001",
          billfrom: "2026-05-01",
          billto: "2026-05-31",
          netamount: 10000,
          gst: 1800,
          totalamount: 11800,
          cheque: "CHQ98765",
          billpassdt: "2026-06-25",
          amountpssd: 10000,
          tds: 200,
          gsttds: 300,
          penalty: 400,
          overpay: 0,
          electricity: 0,
          cess: 0,
          building_cess: 100,
          labour_cess: 0,
          sd: 600,
          deposit: 0,
          postage: 0,
          postal_charge: 0,
          cc: 800,
          security: 0,
          postage_bill_copy: 0,
          welfare_cess: 0,
          conservency: 0,
          pg: 100,
          pg_interest: 0,
          esi: 0,
          pf: 0,
          esi_pfpenalty: 600,
          Linen_Loss: 622,
          berth_charge: 0,
          others: 300,
          Debit_recovery: 0,
          Water_cess_charge: 0,
          low_scoring: 0,
          Material_cost_r: 0,
          BG_late_fee: 0,
          ESI_PF_R: 0,
          short_payment: 0,
          status: "Pending",
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bill Template");

      XLSX.writeFile(workbook, "bill_bulk_upload_template.xlsx");
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error generating local Excel template:", error);
      toast.error("Failed to generate Excel template");
    }
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      toast.error("Please select an Excel file first");
      return;
    }

    try {
      setIsUploadingBulk(true);
      const reader = new FileReader();

      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const workbook = XLSX.read(bstr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const res = await axios.post(
            `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/bulk-upload-bills`,
            { bills: jsonData }
          );

          if (res.status === 201) {
            toast.success(res.data.message || "Bulk items uploaded successfully!");
            setExcelFile(null);
            e.target.reset();
          }
        } catch (uploadError) {
          console.error(uploadError);
          toast.error(
            uploadError?.response?.data?.message ||
              "Something went wrong uploading Excel records"
          );
        } finally {
          setIsUploadingBulk(false);
        }
      };

      reader.onerror = () => {
        toast.error("Error reading file locally.");
        setIsUploadingBulk(false);
      };

      reader.readAsBinaryString(excelFile);
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse file.");
      setIsUploadingBulk(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Bar */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Add Monthly Bill</h1>
              <p className="text-gray-500 mt-1">
                Enter billing details or upload structured files in bulk
              </p>
            </div>

            <button
              onClick={handleDownloadTemplate}
              type="button"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              📊 Download Excel Format
            </button>
          </div>

          {/* Bulk Upload Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-2 border-dashed border-slate-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Bulk Spreadsheet Import
            </h2>
            <form onSubmit={handleBulkUploadSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className={labelClass}>Upload Completed Template File</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setExcelFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-xl p-1"
                />
              </div>
              <button
                type="submit"
                disabled={isUploadingBulk}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-white shadow ${
                  isUploadingBulk ? "bg-gray-400 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-900"
                }`}
              >
                {isUploadingBulk ? "Uploading Data..." : "Upload Excel"}
              </button>
            </form>
          </div>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm font-semibold tracking-wider uppercase">
              Or Add Single Entry Manually
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Single Form Submission */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* General Info & Period */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-5">
                <p className="text-blue-100 text-sm mt-1">Select work category and billing period</p>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <label className={labelClass}>File No for this bill</label>
                    <input
                      type="text"
                      name="fileno"
                      value={auth?.user?.fileno || formData.fileno}
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
                        value={formData.billfrom}
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
                        value={formData.billto}
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
                  <input type="date" name="einvoicedate" value={formData.einvoicedate} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bill Pass Date</label>
                  <input type="date" name="billpassdt" value={formData.billpassdt} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bill Number</label>
                  <input type="text" name="billno" value={formData.billno} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cheque Number</label>
                  <input type="text" name="cheque" value={formData.cheque} onChange={handleChange} className={inputClass} />
                </div>
              <div>
  <label className={labelClass}>Status</label>
  <select
    name="status"
    value={formData.status || "PENDING"}
    onChange={handleChange}
    className={inputClass}
  >
    <option value="PENDING">PENDING</option>
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
                <div>
                  <label className={labelClass}>Net Amount</label>
                  <input type="number" name="netamount" value={formData.netamount} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>GST</label>
                  <input type="number" name="gst" value={formData.gst} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Total Amount</label>
                  <input type="number" name="totalamount" value={formData.totalamount} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Amount Passed</label>
                  <input type="number" name="amountpssd" value={formData.amountpssd} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>TDS</label>
                  <input type="number" name="tds" value={formData.tds} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>TDS GST (gsttds)</label>
                  <input type="number" name="gsttds" value={formData.gsttds} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Penalty</label>
                  <input type="number" name="penalty" value={formData.penalty} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Over Payment</label>
                  <input type="number" name="overpay" value={formData.overpay} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Electricity</label>
                  <input type="number" name="electricity" value={formData.electricity} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cess</label>
                  <input type="number" name="cess" value={formData.cess} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Building Cess</label>
                  <input type="number" name="building_cess" value={formData.building_cess} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Labour Cess</label>
                  <input type="number" name="labour_cess" value={formData.labour_cess} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>SD</label>
                  <input type="number" name="sd" value={formData.sd} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Deposit</label>
                  <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Postage</label>
                  <input type="number" name="postage" value={formData.postage} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Postal Charge</label>
                  <input type="number" name="postal_charge" value={formData.postal_charge} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>CC</label>
                  <input type="number" name="cc" value={formData.cc} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Security</label>
                  <input type="number" name="security" value={formData.security} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Postage Bill Copy</label>
                  <input type="number" name="postage_bill_copy" value={formData.postage_bill_copy} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Welfare Cess</label>
                  <input type="number" name="welfare_cess" value={formData.welfare_cess} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Conservency</label>
                  <input type="number" name="conservency" value={formData.conservency} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>PG</label>
                  <input type="number" name="pg" value={formData.pg} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>PG Interest</label>
                  <input type="number" name="pg_interest" value={formData.pg_interest} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ESI</label>
                  <input type="number" name="esi" value={formData.esi} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>PF</label>
                  <input type="number" name="pf" value={formData.pf} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ESI / PF Penalty</label>
                  <input type="number" name="esi_pfpenalty" value={formData.esi_pfpenalty} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Linen Loss</label>
                  <input type="number" name="Linen_Loss" value={formData.Linen_Loss} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Berth Charge</label>
                  <input type="number" name="berth_charge" value={formData.berth_charge} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Debit Recovery</label>
                  <input type="number" name="Debit_recovery" value={formData.Debit_recovery} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Water & Cess Charge</label>
                  <input type="number" name="Water_cess_charge" value={formData.Water_cess_charge} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Low Scoring</label>
                  <input type="number" name="low_scoring" value={formData.low_scoring} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Material Cost R</label>
                  <input type="number" name="Material_cost_r" value={formData.Material_cost_r} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>BG Late Fee</label>
                  <input type="number" name="BG_late_fee" value={formData.BG_late_fee} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ESI PF R</label>
                  <input type="number" name="ESI_PF_R" value={formData.ESI_PF_R} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Short Payment</label>
                  <input type="number" name="short_payment" value={formData.short_payment} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Others</label>
                  <input type="number" name="others" value={formData.others} onChange={handleChange} className={inputClass} />
                </div>
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

            {/* Submit Button */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Add Bill"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Addbill;