import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Contact = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, offset: 100 }); // Initialize AOS with animation duration and offset
  }, []);

  return (
    <div className="container mx-auto p-7 font-space-grotesk">
      {/* Section Header */}
      <div
        className="text-center mb-12"
        data-aos="fade-down"
      >
        <h1 className="text-3xl font-semibold text-teal-500 mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg font-medium">
          Get in touch with Taru & Sons for any inquiries or service requests. We are happy to assist you!
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

        <div
          className="bg-white p-6 "
          data-aos="fade-right"
        >
          <h2 className="text-2xl font-semibold text-teal-500 mb-4">Our Contact Information</h2>
          <ul className="space-y-4">
            <li className="text-gray-600">
              <strong>Phone:</strong> +1 (234) 567-890
            </li>
            <li className="text-gray-600">
              <strong>Email:</strong> info@taruandsons.com
            </li>
            <li className="text-gray-600">
              <strong>Address:</strong> 123 Main Street, City Name, Country
            </li>
          </ul>
        </div>

   
        <div
          className="bg-white shadow-lg rounded-lg p-6"
          data-aos="fade-left"
        >
          <h2 className="text-2xl font-semibold text-teal-500 mb-4">Send Us a Message</h2>
          <form className="space-y-4">
                    <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

                      <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

    
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                placeholder="Enter your message"
                rows="4"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              ></textarea>
            </div>

      
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div
        className="bg-white shadow-lg rounded-lg p-6"
        data-aos="zoom-in"
      >
        <h2 className="text-2xl font-semibold text-teal-500 mb-4">Find Us on the Map</h2>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.132029510344!2d90.3994523152129!3d23.76372298457956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bca2f5d54297%3A0xc442e5e1f2345c66!2sTaru%20and%20Sons!5e0!3m2!1sen!2sin!4v1632825107424!5m2!1sen!2sin"
          width="100%"
          height="300"
          style={{ border: '0' }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
