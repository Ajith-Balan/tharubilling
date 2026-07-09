import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { toast } from "react-toastify";
import BackButton from "../../components/layout/BackButton";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const EditContract = () => {
  const { id } = useParams(); // Extracts the contract ID from the route parameters
  const navigate = useNavigate();

  const initialState = {
    fileno: "",
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
  const [bgItems, setBgItems] = useState([{ key: "", value: "" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
const [showPassword, setShowPassword] = useState(false);
  // ====== FETCH EXISTING CONTRACT DATA ======
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/getone-contract/${id}`
        );

        if (res.status === 200 && res.data) {
          const contract = res.data;

          // Safely format dates to YYYY-MM-DD for HTML input elements
          const formatDate = (dateStr) => {
            if (!dateStr) return "";
            return dateStr.split("T")[0];
          };

          setFormData({
            ...contract,
            startdate: formatDate(contract.startdate),
            enddate: formatDate(contract.enddate),
            validity: formatDate(contract.validity),
          });

          // Parse the BG string ("key1:val1,key2:val2") back into an editable array structure
          if (contract.bg) {
            const parsedBgItems = contract.bg.split(",").map((item) => {
              const [key, value] = item.split(":");
              return { key: key || "", value: value || "" };
            });
            setBgItems(parsedBgItems);
          } else {
            setBgItems([{ key: "", value: "" }]);
          }
        }
      } catch (error) {
        console.error("Error fetching contract data:", error);
        toast.error("Failed to fetch contract details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchContractData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ====== BANK GUARANTEE HANDLERS ======
  const addBgItem = () => {
    setBgItems([...bgItems, { key: "", value: "" }]);
  };

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

  // ====== SUBMIT UPDATED DATA ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to update this Contract?");
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      const res = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/contracts/update-contract/${id}`,
        formData
      );
      if (res.status === 201 || res.status === 204) {
        toast.success("Contract updated successfully");
        navigate(-1); // Redirect back to previous screen
      } else {
        toast.error("Failed to update contract");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong while updating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-xl font-medium text-gray-600">Loading Contract Details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <BackButton />

          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Edit Contract</h1>
            <p className="text-gray-500 mt-1">Modify contract fields and save changes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Info */}
            <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-5">
                <h2 className="text-2xl font-bold text-white">Contract Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 <div>
                  <label className={labelClass}>File No.</label>
                  <input type="text" name="fileno" value={formData.fileno} onChange={handleChange} className={inputClass} required />
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

                        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-5">
                <h2 className="text-2xl font-bold text-white">Manager Details</h2>
              </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                      <div>
                                        <label className={labelClass}>Manager Name</label>
                                       <input type="text" name="managername" value={formData.managername} onChange={handleChange} className={inputClass}  />
                                     </div>
                                     <div>
                                        <label className={labelClass}>Manager Phone</label>
                                       <input type="text" name="managerphone" value={formData.managerphone} onChange={handleChange} className={inputClass}  />
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
  <label className={labelClass}>Confirm Password to Update</label>
  <div className="relative flex items-center">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={formData.password}
      onChange={handleChange}
      className={`${inputClass} pr-12`} // Added padding-right so text doesn't overlap the eye
      required
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
    </button>
  </div>
</div>
              
              </div>
              
            </div>
            <div className="bg-white flex items-center gap-5 rounded-3xl shadow-xl p-6">


               <div>

                  <label className={labelClass}>Extension Date</label>
                  <input type="date" name="extension" value={formData.extension} onChange={handleChange} className={inputClass} />
                </div>
              <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="completed">Completed</option>
                    <option value="extended">Extended</option>
                  </select>
              </div>

              
              </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors">
              {isSubmitting ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditContract;