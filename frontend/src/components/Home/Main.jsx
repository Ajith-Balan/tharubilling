import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import 'tailwindcss/tailwind.css';

const images = [
  {
    src: 'https://www.shutterstock.com/image-photo/cleaning-staff-clean-washing-subway-600nw-1689684643.jpg',
    text: 'Mechanized Laundry Services',
  },
  {
    src: 'https://thumbs.dreamstime.com/b/leipzig-germany-may-professional-clean-service-cleaning-up-train-trip-railway-station-174012329.jpg',
    text: 'Bedroll Management Services',
  },
  {
    src: 'https://t3.ftcdn.net/jpg/09/73/62/32/360_F_973623275_OtPSeVm7e8fomPiQ4pLHNjhzV4BxfNJD.jpg',
    text: 'Housekeeping Services',
  },
  {
    src: 'https://img.freepik.com/free-photo/subway-train-speeds-through-city-reflecting-modern-architecture-technology-generated-by-artificial-intelligence_188544-109856.jpg',
    text: 'Running Room Services',
  },
];

const Main = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-800 overflow-hidden">
      <div className="w-screen h-screen overflow-hidden">
        <motion.div
          className="flex h-full"
          initial={{ x: 0 }}
          animate={{ x: -currentIndex * 100 + '%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {images.map((item, index) => (
            <div
              key={index}
              className="relative min-w-full h-full bg-white overflow-hidden"
            >
              <img
                src={item.src}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />

              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute top-1/2 left-4 sm:left-8 md:left-12 transform -translate-y-1/2 
                text-white p-4 sm:p-6 rounded-lg bg-black/40 backdrop-blur-sm"
              >
                <h2
                  className="font-bold font-space-grotesk 
                  text-2xl sm:text-3xl md:text-4xl lg:text-6xl leading-tight"
                >
                  {item.text}
                </h2>

                <button
                  className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 
                  text-sm sm:text-base md:text-lg font-medium 
                  bg-teal-600 hover:bg-teal-700 text-white rounded-lg 
                  shadow-lg transition duration-300"
                  onClick={() => alert('Button Clicked!')}
                >
                  Learn More
                </button>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Main;
