import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const WhyWe = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); 
  }, []);

  return (
    <div className="container mx-auto p-7">
      <h1 className="text-5xl text-teal-500 mb-12 font-bold mt-6 font-space-grotesk">Why we?</h1>
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        <div className="flex justify-center">
          <img
            src="https://jan-pro.ca/app/uploads/2023/10/Equipment-needed-VF-2880x1620-1-scaled.jpg"
            alt="Cleaning and Laundry Equipment"
            className="w-full h-auto rounded-lg"
          />
        </div>
        <div data-aos="fade-up">
          <h1 className="text-3xl font-semibold text-teal-500 mb-4 font-space-grotesk">Why Choose Taru & Sons?</h1>
          <p className="text-gray-600 text-sm font-medium mb-6 font-space-grotesk">
            Taru & Sons offers unmatched quality and reliability in cleaning <br /> and laundry services. Here's why you should choose us:
          </p>

          <div className="p-6 bg-white rounded-lg shadow-lg mb-4">
            <div className="flex items-center gap-4">
              <img
                src="https://cdni.iconscout.com/illustration/premium/preview/female-street-cleaning-worker-illustration-download-in-svg-png-gif-file-formats--cleaner-pack-professionals-illustrations-4254827.png?f=webp&h=700"
                alt="Reliable & Trustworthy"
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold mb-2 font-space-grotesk">Reliable & Trustworthy</h2>
                <p className="text-gray-600 text-sm font-space-grotesk">
                  We prioritize customer trust, ensuring high-quality services that meet your expectations every time.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg mb-4">
            <div className="flex items-center gap-4">
              <img
                src="https://www.peopleready.com/wp-content/uploads/2024/01/peopleready_janitorial_bkgr-1.png"
                alt="Customer Satisfaction"
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold mb-2 font-space-grotesk">Customer Satisfaction</h2>
                <p className="text-gray-600 text-sm font-space-grotesk">
                  We prioritize customer satisfaction, ensuring services that consistently exceed expectations.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
              <img
                src="https://cdn-acjoe.nitrocdn.com/zHWbSjyZcxcbylXDsVuzmdepFhlrozXS/assets/images/optimized/rev-f4563e8/www.trustedcleaner.com.au/wp-content/uploads/2023/02/How-To-Get-Leads-for-Residential-Cleaning-Business-1.jpg"
                alt="Attention to Deep Cleaning"
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold mb-2 font-space-grotesk">Attention to Deep Cleaning</h2>
                <p className="text-gray-600 text-sm font-space-grotesk">
                  We provide in-depth cleaning services, paying close attention to detail and ensuring the highest quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyWe;

