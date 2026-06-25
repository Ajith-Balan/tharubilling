import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../../components/layout/Layout'; // Adjust the import path as necessary
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Forget = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitEmail = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_APP_BACKEND}/api/v1/auth/forgetpswd`, {email} );
      setMessage(data.message);
      setError('');
      setOtpSent(true);
    } catch (err) {
      setError('User not found');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async () => {
    if (!otp) {
      setError('OTP is required');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_APP_BACKEND}/api/v1/auth/verifyotp`, { email, otp });
      setMessage(data.message);
      setError('');
      setOtpVerified(true);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async () => {
    if (!newPassword) {
      setError('New password is required');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP_BACKEND}/api/v1/auth/resetpassword`, { email, newPassword });
      toast.success('Password reset successful');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
        } catch (err) {
      setError('Failed to reset password. Please try again.');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className='mt-10'>
        <h2 className="text-lg font-semibold">Enter your email</h2>
        <input
          name='email'
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="border border-gray-300 rounded p-2"
          placeholder="Your email"
        />
        <button
          onClick={submitEmail}
          className={`ml-2 bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>

        {otpSent && (
          <>
            <h2 className="text-lg font-semibold mt-4">Enter the OTP sent to your email</h2>
            <input
              type="text"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              className={`border border-gray-300 rounded p-2`}
              placeholder="OTP"
            />
            <button
              onClick={submitOtp}
              className={`ml-2 bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        {otpVerified && (
          <>
            <h2 className="text-lg font-semibold mt-4">Enter your new password</h2>
            <input
              type="password"
              name='newPassword'
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              className="border border-gray-300 rounded p-2"
              placeholder="New password"
            />
            <button
              onClick={submitNewPassword}
              className={`ml-2 bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        {message && <p className="text-green-600 mt-2">{message}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </Layout>
  );
};

export default Forget;
