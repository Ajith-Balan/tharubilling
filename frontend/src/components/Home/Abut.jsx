import React, { useEffect } from "react";
import { IoMdTime } from "react-icons/io";
import { FaUsers } from "react-icons/fa6";
import AOS from "aos";
import "aos/dist/aos.css";
import Layout from "../layout/Layout";

const Abut = () => {
  const satisfactionPercentage = 98;

  useEffect(() => {
    AOS.init({ duration: 1200, easing: "ease-out" });
  }, []);

  return (
    <Layout>

    <div className="h-full mt-[12vh]">
      <div className="container mx-auto p-7 relative">
        <h1 className="text-4xl font-bold text-teal-500 mb-12 font-space-grotesk">About us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6">
          <div data-aos="fade-right" className="space-y-6">
            <h1 className="text-2xl font-semibold mb-4">Who we are ?</h1>
            <h2 className="text-3xl font-bold text-teal-500 mb-4 font-space-grotesk">
              Tharu & Sons, established in 1998, is a leading service provider
              of specialized services
            </h2>
            <p className="text-gray-600 mb-6 font-medium text-sm font-space-grotesk">
              Tharu & Sons, established in 1998, is a leading service provider
              of specialized services like operating a fully mechanized laundry
              service on BOOT (Build-Own-Operate-Transfer) basis, linen
              management, running room services, mechanized cleaning, onboard
              housekeeping services, etc. for various divisions of Indian
              Railway and other private and public sector undertakings and
              luxury hotels across India.
            </p>

            <div className="w-full max-w-md bg-white" data-aos="fade-up">
              <h2 className="text-sm font-semibold text-teal-500 mb-4">
                Client Satisfaction
              </h2>
              <div className="w-full bg-gray-200 h-2 overflow-hidden">
                <div
                  className="bg-teal-500 h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${satisfactionPercentage}%` }}
                >
                  {satisfactionPercentage}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6" data-aos="zoom-in">
              <button className="flex items-center gap-3">
                <FaUsers className="w-12 h-12 shadow p-2 text-teal-500" />
                <h1 className="text-lg font-bold text-teal-500 font-space-grotesk">
                  Professional and Creative Staff
                </h1>
              </button>
              <button className="flex items-center gap-3">
                <IoMdTime className="w-12 h-12 shadow p-2 text-teal-500" />
                <h1 className="text-lg font-bold text-teal-500 font-space-grotesk">On-time Services</h1>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="w-full h-full" data-aos="fade-left">
              <img
                src="https://images.crowdspring.com/blog/wp-content/uploads/2023/06/28162522/how-to-start-a-cleaning-business-hero.png"
                alt="About Us"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
        </Layout>

  );
};

export default Abut;
