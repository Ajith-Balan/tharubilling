import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { toast } from "react-toastify";
import BackButton from "../../components/layout/BackButton";
import * as XLSX from "xlsx"; 
import { FaFileExcel, FaUpload, FaDownload } from "react-icons/fa";

const Addcontracts = () => {
  const [bgItems, setBgItems] = useState([{ key: "", value: "" }]);
  const initialState = {
    date: "",
    trainname: "",
    workname: "",
    nameofthework: "",
    railway: "",
    division: "",
    contractNumber: "",
    extension: "",
    password: "",
    startdate: "",
    enddate: "",
    contractvalue: "",
    bg: "",
    validity: "",
    status: "ongoing",
  };

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ====== EXCEL TEMPLATE DOWNLOAD HANDLER ======
  const downloadTemplate = () => {
    // Define exact headers matching your database structure expectations
    const templateData = [
      {
        "File No": "123",
        "Railway": "Central Railway",
        "Division": "Mumbai",
        "Work Name": "MCC,PFTR",
        "Train Name/NOS": "12105 / Vidarbha Exp",
        "Contract Number": "CR-BB-CL-2026-04",
        "Date": "2026-04-11",
        "Start Date": "2026-07-01",
        "End Date": "2029-06-30",
        "Extension": "2027-05-31",
        "Contract Value": 4500000,
        "Bank Guarantee": "BG123:50000,BG124:25000",
        "Validity Date": "2029-08-31",
        "Status": "ongoing",
        "Name of the Work": "Deep Cleaning Contract for Express Trains",
        "Password": "SecurePass789",

      }
    ];

    // Create sheet and workbook context
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contracts Template");

    // Write file context and trigger browser download
    XLSX.writeFile(workbook, "Contracts_Bulk_Upload_Template.xlsx");
    toast.info("Template download started");
  };

  // ====== EXCEL BULK UPLOAD HANDLER ======
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const confirmed = window.confirm(`Are you sure you want to bulk import contracts from ${file.name}?`);
    if (!confirmed) { e.target.value = ""; return; }

    setIsBulkUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          toast.error("Excel sheet looks empty.");
          setIsBulkUploading(false);
          return;
        }

        const res = await axios.post(
          `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/bulk-create`,
          { contracts: rawData }
        );

        if (res.status === 201) {
          toast.success(`${res.data.count || rawData.length} Contracts imported successfully!`);
        } else {
          toast.error("Failed to bulk import data.");
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Error processing Excel configuration data.");
      } finally {
        setIsBulkUploading(false);
        e.target.value = ""; 
      }
    };

    reader.readAsBinaryString(file);
  };

  // ====== EXISTING HANDLERS ======
  const addBgItem = () => { setBgItems([...bgItems, { key: "", value: "" }]); };
  const removeBgItem = (index) => {
    const updated = bgItems.filter((_, i) => i !== index);
    setBgItems(updated);
    updateBgString(updated);
  };
  const handleBgChange = (index, field, value) => {
    const updated = [...bgItems];
    updated[index][field] = value;
    setBgItems(updated);
    updateBgString(updated);
  };
  const updateBgString = (items) => {
    const bgString = items
      .map((item) => `${item.key}:${item.value}`)
      .filter((item) => item !== ":")
      .join(",");
    setFormData((prev) => ({ ...prev, bg: bgString }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to add this Contract?");
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/createcontract`,
        formData
      );
      if (res.status === 201) {
        toast.success("Contract added successfully");
        setFormData(initialState);
        setBgItems([{ key: "", value: "" }]);
      } else {
        toast.error("Failed to add contract");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Add Contracts</h1>
              <p className="text-gray-500 mt-1">Enter details manually or drop an Excel spreadsheet</p>
            </div>
            
            {/* ====== EXCEL BULK TOOLS SECTION ====== */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg hidden sm:block">
                <FaFileExcel size={24} />
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide text-center sm:text-left">Excel Bulk Actions</span>
                <div className="flex gap-2">
                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    <FaDownload size={10} />
                    Download Template
                  </button>

                  {/* Upload Button */}
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer transition-colors whitespace-nowrap">
                    <FaUpload size={10} />
                    {isBulkUploading ? "Processing..." : "Upload Excel"}
                    <input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      className="hidden" 
                      onChange={handleExcelUpload}
                      disabled={isBulkUploading} 
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form remains exactly as before */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Info */}
            <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 p-5">
                <h2 className="text-2xl font-bold text-white">Contract Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 <div>
                  <label className={labelClass}> Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Railway</label>
                  <input type="text" name="railway" value={formData.railway} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Division</label>
                  <input type="text" name="division" value={formData.division} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Work Name</label>
                  <input type="text" name="workname" value={formData.workname} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Name of the Work</label>
                  <input type="text" name="nameofthework" value={formData.nameofthework} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Train Name/NOS</label>
                  <input type="text" name="trainname" value={formData.trainname} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Contract/LOA Number</label>
                  <input type="text" name="contractNumber" value={formData.contractNumber} onChange={handleChange} className={inputClass} required />
                </div>
              </div>
            </div>

            {/* Contract Duration */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-semibold mb-5">Contract Duration</h3>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="date" name="startdate" value={formData.startdate} onChange={handleChange} className={inputClass} />
                </div>
                <div className="hidden md:flex justify-center pb-3">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full">→</div>
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input type="date" name="enddate" value={formData.enddate} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-semibold mb-5">Financial Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Contract Value</label>
                  <input type="number" name="contractvalue" value={formData.contractvalue} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bank Guarantee</label>
                  {bgItems.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" placeholder="Key" value={item.key} onChange={(e) => handleBgChange(index, "key", e.target.value)} className={`${inputClass} flex-1`} />
                      <input type="text" placeholder="Value" value={item.value} onChange={(e) => handleBgChange(index, "value", e.target.value)} className={`${inputClass} flex-1`} />
                      {index === bgItems.length - 1 && (
                        <button type="button" onClick={addBgItem} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">+</button>
                      )}
                      {bgItems.length > 1 && (
                        <button type="button" onClick={() => removeBgItem(index)} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">×</button>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <label className={labelClass}>Validity Date</label>
                  <input type="date" name="validity" value={formData.validity} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                    <option value="ongoing">Ongoing</option>
                    <option value="not-started">Not started</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold">
              {isSubmitting ? "Submitting..." : "Add Contract"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Addcontracts;