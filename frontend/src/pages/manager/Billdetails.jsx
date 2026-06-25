import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import axios from "axios";
import AdminMenu from "../../components/layout/AdminMenu";
import { FaEdit, FaSave, FaTrash, FaTimes, FaPlus, FaFileInvoiceDollar,FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

const Billdetails = () => {
  const [auth] = useAuth();
  const [bills, setBills] = useState([]);
  const [contract, setContract] = useState({});
  const [editId, setEditId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { fileno } = useParams();

  // All keys structured to strictly match backend payload properties
  const dynamicKeys = [
    { key: "gst", label: "GST", isNumeric: true },
    { key: "totalamount", label: "Amount", isNumeric: true },
    { key: "netamount", label: "Net Received", isNumeric: true },
    { key: "amountpssd", label: "Amount Passed", isNumeric: true },
    { key: "tds", label: "TDS", isNumeric: true },
    { key: "gsttds", label: "GST-TDS", isNumeric: true },
    { key: "cc", label: "CC", isNumeric: true },
    { key: "sd", label: "SD", isNumeric: true },
    { key: "esi_pfpenalty", label: "ESI/PF Penalty", isNumeric: true },
    { key: "Linen_Loss", label: "Linen Loss", isNumeric: true },
    { key: "others", label: "Others", isNumeric: true },
    { key: "penalty", label: "Penalty", isNumeric: true },
    { key: "cheque", label: "Cheque/Ref", isNumeric: false },
  ];

  const fetchBills = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/getcontractbills/${fileno}`
      );
      const sortedBills = (res.data.bills || []).sort(
        (a, b) => new Date(b.month + "-01") - new Date(a.month + "-01")
      );
      setBills(sortedBills);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  const fetchContract = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/get-contract-by-fileno/${fileno}`
      );
      const contractData = Array.isArray(res.data) ? res.data[0] : res.data;
      setContract(contractData || {});
    } catch (err) {
      console.error("Error fetching contract:", err);
    }
  };

  useEffect(() => {
    if (auth?.user) {
      fetchBills();
      fetchContract();
    }
  }, [auth?.user, fileno]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/delete-bill/${id}`
      );
      toast.success("Bill Deleted Successfully");
      fetchBills();
    } catch {
      toast.error("Error deleting bill");
    }
  };

  const handleEditClick = (bill) => {
    setEditId(bill._id);
    
    // Construct values dynamically matching dynamicKeys definition structure explicitly
    const baseEdits = {
      einvoicedate: bill.einvoicedate ? bill.einvoicedate.split('T')[0] : "",
      billno: bill.billno || "",
      fileno: bill.fileno || "",
      work: bill.work || "",
      billfrom: bill.billfrom ? bill.billfrom.split('T')[0] : "",
      billto: bill.billto ? bill.billto.split('T')[0] : "",
      billpassdt: bill.billpassdt ? bill.billpassdt.split('T')[0] : "",
      status: bill.status || "",
    };

    dynamicKeys.forEach((col) => {
      baseEdits[col.key] = bill[col.key] ?? (col.isNumeric ? 0 : "");
    });

    setEditedData(baseEdits);
  };

  const handleInputChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleCancelEdit = () => {
    setEditId(null);
  };

  const handleSaveClick = async (id) => {
    if (!window.confirm("Are you sure you want to Update this bill?")) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/bills/update-bill/${id}`,
        editedData
      );
      toast.success("Bill Updated Successfully");
      setEditId(null);
      fetchBills();
    } catch {
      toast.error("Error updating bill");
    }
  };

  const filteredBills = bills;

  const totalBillValue = filteredBills.reduce((sum, b) => sum + (Number(b.totalamount) || 0), 0);
  const totalNetAmount = filteredBills.reduce((sum, b) => sum + (Number(b.netamount) || 0), 0);
  const totalPenalty = filteredBills.reduce((sum, b) => sum + (Number(b.penalty) || 0), 0);

  const getContractPeriod = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months <= 0 ? 1 : months;
  };

  const contractperiod =
    contract.startdate && contract.enddate
      ? getContractPeriod(contract.startdate, contract.enddate)
      : 0;

  const pendingBills = filteredBills.filter((bill) => bill.status !== "Bill Passed");
  const passedBills = filteredBills.filter((bill) => bill.status === "Bill Passed");

  const lastPassedMonth =
    passedBills.length > 0
      ? new Date(passedBills[passedBills.length - 1].billfrom).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })
      : "No bills passed yet";

  const formatCurrency = (num) => {
    if (num === undefined || num === null || isNaN(num)) return "-";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num);
  };

  const calculateTotal = (key) => {
    return filteredBills.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
  };

  return (
    <Layout title="Bill Details Ledger - Manager">
      <div className="flex flex-col lg:flex-row bg-slate-50 min-h-screen font-sans">
        <AdminMenu />
        <main className="flex-1 p-6 overflow-x-hidden">
          
          {/* ====== PREMIUM BRANDED HEADER ====== */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 mb-4">
              <div>
                  <h1 className="text-xl  p-2 rounded shadow text-black font-bold tracking-tight text-slate-900 uppercase">
                 Status:  <span className="font-semibold p-1"> {contract.status || "_" } </span>
                </h1>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  <span className="font-semibold"> File No: </span> {contract.fileno || "File No. Not Available"}
                </h1>
               
                <h2 className="text-lg font-bold text-red-600 tracking-wide mt-0.5 uppercase">
                  {contract.workname || "Contract Name Not Available"}
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-4xl mt-1 leading-relaxed">
                  <span className="font-semibold text-slate-700">Name of the Work:</span> {contract.nameofthework}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <Link
                  to="/dashboard/manager/addbills"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm hover:bg-emerald-700 transition-all duration-150"
                >
                  <FaPlus size={14} /> Add New Bill Entry
                </Link>
                <Link
                  to={`/dashboard/manager/editcon/${contract._id}`}
                  className="inline-flex items-center gap-2 bg-slate-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm hover:bg-slate-700 transition-all duration-150"
                >
                  <FaEdit size={14} /> Edit Contract
                </Link>
              </div>
            </div>

            {/* ====== METADATA LEDGER GRID ====== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700">
              <div className="space-y-2 border-r border-slate-100 pr-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Contract Number</span>
                  {contract.contractNumber || <span className="text-slate-500 italic">N/A</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Commencement</span>
                    {contract.startdate ? (
                      <span className="font-semibold text-slate-800">
                        {new Date(contract.startdate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : "N/A"}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Completion</span>
                    {contract.enddate ? (
                      <span className="font-semibold text-slate-800">
                        {new Date(contract.enddate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : "N/A"}
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-xs text-slate-400 font-semibold block">Extended Till</span>
                  {contract.extension ? (
                    <span className="font-semibold text-slate-800">
                      {new Date(contract.extension).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">N/A</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-r border-slate-100 px-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Total Contract Value</span>
                  <span className="text-lg font-extrabold text-slate-990 font-mono">₹ {formatCurrency(contract.contractvalue)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Period Value</span>
                    <span className="font-medium text-slate-800 font-mono">₹ {formatCurrency(contract.contractvalue / (contractperiod || 1))}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Contract Period</span>
                    <span className="font-semibold text-indigo-600  px-2 py-0.5 rounded text-xs inline-block mt-0.5">{contractperiod} Months</span>
                  </div>
                 <div className="pt-1">
  <span className="text-xs text-slate-400 font-semibold block mb-0.5">Password</span>
  <div className="inline-flex items-center gap-2 bg-blue-50 px-2 py-0.5 rounded text-xs mt-0.5">
    <span className="font-semibold text-blue-600 font-mono tracking-wider">
      {showPassword ? contract.password || "N/A" : "••••••••"}
    </span>
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-blue-400 hover:text-blue-600 transition-colors focus:outline-none ml-1"
      title={showPassword ? "Hide Password" : "Show Password"}
    >
      {showPassword ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
    </button>
  </div>
</div>
                </div>
              </div>

              <div className="space-y-2 pl-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Bank Guarantee Details</span>
                  {contract?.bg ? (
                    contract.bg.split(",").map((item, index) => {
                      const [key, value] = item.split(":");
                      return (
                        <span key={index} className="font-semibold text-slate-800 block text-xs">
                          {key}: {value}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-slate-400 italic text-xs">N/A</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">BG Validity</span>
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs inline-block mt-0.5">{formatDate(contract?.validity)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Actual Penalty Total</span>
                    <span className="font-bold text-red-600 font-mono block">₹ {formatCurrency(totalPenalty)}</span>
                    <span className="text-xs font-bold text-red-600">
                      {contract?.contractvalue ? ((totalPenalty / contract.contractvalue) * 100).toFixed(2) : "0.00"}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====== EXECUTIVE SUMMARY CARDS ====== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Bill Value</p>
                <p className="text-xl font-black text-blue-600 font-mono mt-1">₹ {formatCurrency(totalBillValue)}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg hidden sm:block"><FaFileInvoiceDollar size={20} /></div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Amount Collected</p>
                <p className="text-xl font-black text-emerald-600 font-mono mt-1">₹ {formatCurrency(totalNetAmount)}</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg hidden sm:block"><FaFileInvoiceDollar size={20} /></div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Penalty Deducted</p>
                <p className="text-xl font-black text-red-600 font-mono mt-1">₹ {formatCurrency(totalPenalty)}</p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-lg hidden sm:block"><FaFileInvoiceDollar size={20} /></div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Balance to be Billed</p>
                <p className="text-xl font-black text-purple-600 font-mono mt-1">₹ {formatCurrency(contract?.contractvalue - totalBillValue || 0)}</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg hidden sm:block"><FaFileInvoiceDollar size={20} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Last Passed Bill Month</span>
              <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full">{lastPassedMonth}</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Pending Operations Checklist</span>
              <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">{pendingBills.length} Bills Awaiting Approval</span>
            </div>
          </div>

          {/* ====== FINANCIAL LEDGER WORKBOOK TABLE / CONTENT ====== */}
          {filteredBills.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <p className="text-slate-400 font-medium">No ledger accounts or bill items found.</p>
            </div>
          ) : (
            <>
              {/* Desktop Layout */}
              <div className="hidden xl:block overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="min-w-full text-xs font-medium text-slate-700 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th rowSpan="2" className="px-3 py-3 border-r border-slate-200 text-center font-bold">Date</th>
                      <th rowSpan="2" className="px-3 py-3 border-r border-slate-200 text-center font-bold">Bill No.</th>
                      <th rowSpan="2" className="px-3 py-3 border-r border-slate-200 text-center font-bold">File No.</th>
                      <th rowSpan="2" className="px-3 py-3 border-r border-slate-200 text-left font-bold">Work Description</th>
                      <th colSpan="2" className="px-3 py-1.5 border-r border-slate-200 text-center font-bold tracking-wider uppercase bg-slate-100">Period</th>
                      <th colSpan={dynamicKeys.length} className="px-3 py-1.5 border-r border-slate-200 text-center font-bold tracking-wider uppercase bg-slate-50 text-slate-600">
                        Collection Ledger Breakup
                      </th>
                      <th rowSpan="2" className="px-3 py-3 border-r border-slate-200 text-center font-bold">Passed Date</th>
                      <th rowSpan="2" className="px-3 py-3 border-r border-slate-200 text-center font-bold">Status</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold min-w-[100px]">Actions</th>
                    </tr>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="px-2 py-2 border-r border-slate-200 text-center font-semibold">From</th>
                      <th className="px-2 py-2 border-r border-slate-200 text-center font-semibold">To</th>
                      {dynamicKeys.map(col => (
                        <th key={col.key} className={`px-2 py-2 border-r border-slate-200 font-semibold ${col.isNumeric ? 'text-right' : 'text-center'}`}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                    {filteredBills.map((bill) => {
                      const isEditing = editId === bill._id;
                      return (
                        <tr key={bill._id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Invoice Date */}
                          <td className="px-2 py-3 border-r border-slate-200 text-center whitespace-nowrap text-slate-500">
                            {isEditing ? (
                              <input type="date" name="einvoicedate" value={editedData.einvoicedate || ""} onChange={handleInputChange} className="border border-slate-300 rounded px-1 py-0.5 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                            ) : (
                              formatDate(bill.einvoicedate)
                            )}
                          </td>

                          {/* Bill No */}
                          <td className="px-2 py-3 border-r border-slate-200 text-center font-bold text-indigo-600 whitespace-nowrap">
                            {isEditing ? (
                              <input type="text" name="billno" value={editedData.billno || ""} onChange={handleInputChange} className="border border-slate-300 rounded px-1 py-0.5 w-16 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                            ) : (
                              bill.billno || "N/A"
                            )}
                          </td>

                          {/* File No */}
                          <td className="px-2 py-3 border-r border-slate-200 text-center text-slate-500 whitespace-nowrap">
                            {isEditing ? (
                              <input type="text" name="fileno" value={editedData.fileno || ""} onChange={handleInputChange} className="border border-slate-300 rounded px-1 py-0.5 w-16 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                            ) : (
                              bill.fileno || "N/A"
                            )}
                          </td>

                          {/* Work Info */}
                          <td className="px-2 py-3 border-r border-slate-200 text-left font-sans max-w-xs truncate">
                            {isEditing ? (
                              <input type="text" name="work" value={editedData.work || ""} onChange={handleInputChange} className="border border-slate-300 rounded px-1 py-0.5 w-full text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                            ) : (
                              bill.work || "N/A"
                            )}
                          </td>

                          {/* Bill From */}
                          <td className="px-2 py-3 border-r border-slate-200 text-center text-slate-500 whitespace-nowrap">
                            {isEditing ? (
                              <input type="date" name="billfrom" value={editedData.billfrom || ""} onChange={handleInputChange} className="border border-slate-300 rounded px-1 py-0.5 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                            ) : (
                              formatDate(bill.billfrom)
                            )}
                          </td>

                          {/* Bill To */}
                          <td className="px-2 py-3 border-r border-slate-200 text-center text-slate-500 whitespace-nowrap">
                            {isEditing ? (
                              <input type="date" name="billto" value={editedData.billto || ""} onChange={handleInputChange} className="border border-slate-300 rounded px-1 py-0.5 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                            ) : (
                              formatDate(bill.billto)
                            )}
                          </td>

                          {/* Render Breakdown Columns dynamically */}
                          {dynamicKeys.map(col => (
                            <td key={col.key} className={`px-2 py-3 border-r border-slate-200 ${col.isNumeric ? 'text-right' : 'text-center'}`}>
                              {isEditing ? (
                                <input
                                  type={col.isNumeric ? "number" : "text"}
                                  name={col.key}
                                  value={editedData[col.key] ?? ""}
                                  onChange={handleInputChange}
                                  className="border border-slate-300 rounded px-1 py-0.5 w-20 text-right text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              ) : (
                                col.isNumeric ? formatCurrency(bill[col.key] || 0) : (bill[col.key] || "N/A")
                              )}
                            </td>
                          ))}

                          {/* Bill Pass Date */}
                          <td className="px-2 py-3 border-r border-slate-200 text-center text-slate-500 whitespace-nowrap">
                            {isEditing ? (
                              <input type="date" name="billpassdt" value={editedData.billpassdt || ""} onChange={handleInputChange} className="border border-slate-300 rounded px-1 py-0.5 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                            ) : (
                              formatDate(bill.billpassdt)
                            )}
                          </td>

                          {/* Status Column */}
                          <td className="px-2 py-3 border-r border-slate-200 text-center font-sans">
                            {isEditing ? (
                              <select name="status" value={editedData.status || ""} onChange={handleInputChange} className="border border-slate-300 rounded text-xs px-1 py-0.5 bg-white focus:ring-1 focus:ring-blue-500 outline-none">
                                <option value="">-- Select --</option>
                                <option value="Processing">Processing</option>
                                <option value="Passed to Division">Passed to Division</option>
                                <option value="Accounts">Accounts</option>
                                <option value="Bill Passed">Bill Passed</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${bill.status === "Bill Passed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                                {bill.status || "Processing"}
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="px-2 py-3 text-center font-sans">
                            <div className="flex justify-center items-center gap-2">
                              {isEditing ? (
                                <>
                                  <button onClick={() => handleSaveClick(bill._id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Save Row"><FaSave size={14} /></button>
                                  <button onClick={handleCancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 rounded" title="Cancel"><FaTimes size={14} /></button>
                                </>
                              ) : (
                                <button onClick={() => handleEditClick(bill)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><FaEdit size={14} /></button>
                              )}
                              <button onClick={() => handleDelete(bill._id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><FaTrash size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Footer Summary Row */}
                  <tfoot>
                    <tr className="bg-slate-100 font-mono font-bold text-slate-900 border-t-2 border-slate-300">
                      <td colSpan="6" className="px-3 py-3 border-r border-slate-200 text-right uppercase tracking-wider font-sans text-xs">Total Summary:</td>
                      {dynamicKeys.map(col => (
                        <td key={`total-${col.key}`} className={`px-2 py-3 border-r border-slate-200 ${col.isNumeric ? 'text-right text-indigo-700' : 'text-center text-slate-400'}`}>
                          {col.isNumeric ? formatCurrency(calculateTotal(col.key)) : "—"}
                        </td>
                      ))}
                      <td colSpan="3" className="bg-slate-50"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Responsive Card Layout for Mobile Screens */}
              <div className="block xl:hidden space-y-4">
                {filteredBills.map((bill) => (
                  <div key={bill._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm font-sans">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded">
                          Bill #{bill.billno || "N/A"}
                        </span>
                        <span className="text-xs text-slate-400 font-medium ml-2 font-mono">{formatDate(bill.einvoicedate)}</span>
                      </div>
                      <div className="flex gap-2">
                        {editId === bill._id ? (
                          <>
                            <button onClick={() => handleSaveClick(bill._id)} className="text-emerald-600 p-1"><FaSave size={16} /></button>
                            <button onClick={handleCancelEdit} className="text-slate-400 p-1"><FaTimes size={16} /></button>
                          </>
                        ) : (
                          <button onClick={() => handleEditClick(bill)} className="text-blue-600 p-1"><FaEdit size={16} /></button>
                        )}
                        <button onClick={() => handleDelete(bill._id)} className="text-slate-400 hover:text-red-600 p-1"><FaTrash size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 font-sans block">Gross Amount:</span>
                        <span className="font-bold text-slate-800">₹ {formatCurrency(bill.totalamount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block">Net Collection:</span>
                        <span className="font-bold text-emerald-600">₹ {formatCurrency(bill.netamount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block">Deducted Penalty:</span>
                        <span className="font-bold text-red-600">₹ {formatCurrency(bill.penalty)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block">Processing Status:</span>
                        <span className="font-sans font-bold text-indigo-600">{bill.status || "Processing"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default Billdetails;