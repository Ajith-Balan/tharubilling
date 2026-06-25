import React from 'react';
import Layout from '../components/layout/Layout';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

// You can replace this URL with any other image URL from Unsplash or similar sites.
const contactImage = 'https://cdn.pixabay.com/photo/2022/01/12/18/51/contact-us-6933645_1280.jpg';

const Contact = () => {
  return (
      <Layout title={'Contact Us'}>
        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-4 text-center text-red-600">Contact Us</h2>
          <img src={contactImage} alt="Contact" className="w-full h-40 object-cover rounded-md mb-4" />

          <div className="flex items-center mb-4">
            <FaMapMarkerAlt className="text-red-600 h-6 w-6 mr-2" />
            <p>
              [CJ ATTIRE] <br />
              [Kerala, Palakkad <br />
              Pin 678510, Nenmmara]
            </p>
          </div>

          <div className="flex items-center mb-4">
            <FaEnvelope className="text-red-600 h-6 w-6 mr-2" />
            <p>Email: <a href="mailto:Cjattire2001@gmail.com" className="text-red-600 hover:underline">cjattire2001@gmail.com</a></p>
          </div>

          <div className="flex items-center">
            <FaPhoneAlt className="text-red-600 h-6 w-6 mr-2" />
            <p>Phone: <a href="tel:9745035868" className="text-red-600 hover:underline">9745035868</a></p>
          </div>
        </div>
      </Layout>
  );
}

export default Contact;
