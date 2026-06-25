import React from 'react'
import Layout from '../components/layout/Layout'

import { useNavigate } from 'react-router-dom'; // For navigation

const Pagenotfound = () => {
    const navigate = useNavigate(); // Hook for navigation

    const handleGoBack = () => {
      navigate(-1); // Go back to the previous page
    };
  return (
    <div>
              <Layout title={'go back page not found'}>

        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl text-gray-600 mt-4">Page Not Found</p>
      <p className="text-md text-gray-500 mt-2">The page you're looking for doesn't exist.</p>

      {/* Go Back Button */}
      <button
        onClick={handleGoBack}
        className="mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
      >
        Go Back
      </button>
    </div>
    </Layout>

    </div>
  )
}

export default Pagenotfound
