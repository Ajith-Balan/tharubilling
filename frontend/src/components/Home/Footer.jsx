import React from 'react';
import { FaInstagram, FaWhatsapp, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-yellow-600 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       
          <div>
            <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FaPhoneAlt className="h-5 w-5" />
                <span>+91 907421 5454</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="h-5 w-5" />
                <span>info@tharuandsons.in</span>
              </div>
            </div>
          </div>

         
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="hover:text-gray-300 transition duration-300"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="hover:text-gray-300 transition duration-300"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="hover:text-gray-300 transition duration-300"
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-gray-300 transition duration-300"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Follow Us</h2>
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/cj_attire"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition duration-300"
              >
                <FaInstagram className="h-6 w-6" />
              </a>
              <a
                href="https://wa.me/qr/VIQQXSHMF7K4O1"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition duration-300"
              >
                <FaWhatsapp className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-teal-700 mt-8 pt-4 text-center text-sm">
          © {new Date().getFullYear()} Tharu & Sons. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
