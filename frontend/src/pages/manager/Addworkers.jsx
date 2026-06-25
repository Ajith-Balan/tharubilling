import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../components/layout/AdminMenu';

const Addworkers = () => {
  const [loadingIfsc, setLoadingIfsc] = useState(false);
  const [ifscError, setIfscError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    work: '',
    name: '',
    phone: '',
    aadhar: '',
    dob: "",
    category: '',
    wage: '',
    bank: '',
    branch: '',
    ifsccode: '',
    acnumber: '',
    uanno: '',
    esino: '',
    status: '',
    designation: ''
  });

  const navigate = useNavigate();

  // IFSC code handler
  const ifsccodechange = async (e) => {
    const { name, value } = e.target;
    const upperIFSC = value.toUpperCase();
    setFormData((prev) => ({ ...prev, [name]: upperIFSC }));

    if (name === 'ifsccode' && upperIFSC.length === 11) {
      setLoadingIfsc(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_APP_BACKEND}/api/v1/worker/get-ifsc/${upperIFSC}`);
        setFormData((prev) => ({
          ...prev,
          bank: res.data.BANK,
          branch: res.data.BRANCH,
        }));
        setIfscError('');
      } catch (err) {
        setFormData((prev) => ({ ...prev, bank: '', branch: '' }));
        setIfscError('⚠️ Enter a valid IFSC code');
      } finally {
        setLoadingIfsc(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, phone, aadhar } = formData;
    if (!name || !aadhar || !phone ) {
      toast.error('Please fill all required fields');
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be 10 digits');
      return false;
    }
    if (!/^\d{12}$/.test(aadhar)) {
      toast.error('Aadhar number must be 12 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
   if (!window.confirm("Are you sure you want to Add this Worker?")) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/api/v1/worker/create-worker`,
        formData
      );
      if (res.status === 201) {
        toast.success('Worker added successfully');
        setFormData({
          work: '',
          name: '',
          phone: '',
          aadhar: '',
          dob: '',
          category: '',
          wage: '',
          bank: '',
          branch: '',
          ifsccode: '',
          acnumber: '',
          uanno: '',
          esino: '',
          status: '',
          designation: ''
        });
      } else if (res.status === 200) {
        toast.error('Already registered, please login');
      } else {
        toast.error('Registration failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title='Manager Add Worker'>
      <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
        {/* Top Menu on mobile / Sidebar on desktop */}
        <div className="w-full md:w-64 mb-4 md:mb-0 md:mr-4">
          <AdminMenu />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center items-start py-6 px-4 sm:px-6">
          <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Add Worker
            </h2>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              
              {/* Work */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Work</label>
                <select
                  name="work"
                  value={formData.work}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select work</option>
                  <option value="mcc">MCC</option>
                  <option value="acca">ACCA</option>
                  <option value="bio">BIO</option>
                  <option value="pftr">PFTR</option>
                  <option value="pit & yard">PIT & YARD</option>
                  <option value="laundry">LAUNDRY</option>
                </select>
              </div>

              {/* Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Staff Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Staff Name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Staff Phone Number"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

            


           <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Designation
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-800 text-sm"
                >
                  <option value="" disabled>
                    Select Designation
                  </option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Cleaning Staff">Cleaning Staff</option>

                </select>
              </div>

              {/* Aadhar */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                <input
                  type="text"
                  name="aadhar"
                  placeholder="Aadhar Number"
                  required
                  value={formData.aadhar}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div> 

                <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Date of Birth </label>
                <input
                  type="date"
                  name="dob"
                  placeholder="DOB"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Wage */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Wage Per Day</label>
                <input
                  type="text"
                  name="wage"
                  placeholder="Wage Per Day"
                  value={formData.wage}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* IFSC */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="ifsccode"
                  placeholder="Enter IFSC Code"
                  value={formData.ifsccode}
                  onChange={ifsccodechange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    ifscError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {loadingIfsc && <p className="text-sm text-blue-600 mt-1">Checking IFSC...</p>}
                {ifscError && <p className="text-sm text-red-600 mt-1">{ifscError}</p>}
              </div>

              {/* Bank */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bank"
                  placeholder="Bank Name"
                  value={formData.bank}
                  readOnly
                  className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
                />
              </div>

              {/* Branch */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  name="branch"
                  placeholder="Branch Name"
                  value={formData.branch}
                  readOnly
                  className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
                />
              </div>

              {/* Account Number */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  name="acnumber"
                  placeholder="Account Number"
                  value={formData.acnumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* UAN */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">UAN Number</label>
                <input
                  type="text"
                  name="uanno"
                  placeholder="UAN Number"
                  value={formData.uanno}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ESI */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">ESI Number</label>
                <input
                  type="text"
                  name="esino"
                  placeholder="ESI Number"
                  value={formData.esino}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 text-white rounded-md ${
                    isSubmitting ? 'bg-gray-400' : 'bg-yellow-900 hover:bg-gray-900'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Add Worker'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Addworkers;
