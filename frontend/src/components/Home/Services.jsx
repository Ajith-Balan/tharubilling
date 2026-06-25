import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaArrowRight } from "react-icons/fa";

const Services = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: false,
    });
  }, []);

  const services = [
    {
      img: "https://media.istockphoto.com/id/459292777/photo/laundry-service.jpg?s=612x612&w=0&k=20&c=V-fCS_ZhDA8_sqySt4-twQhovKdDrB9b71WBE_M6k1Q=",
      text: "Mechanized Laundry Services",
      pg: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. and init",
    },
    {
      img: "https://media.istockphoto.com/id/459292777/photo/laundry-service.jpg?s=612x612&w=0&k=20&c=V-fCS_ZhDA8_sqySt4-twQhovKdDrB9b71WBE_M6k1Q=",
      text: "Bedroll Management Services",
      pg: "Curabitur vehicula urna sit amet neque luctus, at efficitur quam dapibus.",
    },
    {
      img: "https://media.istockphoto.com/id/459292777/photo/laundry-service.jpg?s=612x612&w=0&k=20&c=V-fCS_ZhDA8_sqySt4-twQhovKdDrB9b71WBE_M6k1Q=",
      text: "Housekeeping Services",
      pg: "Curabitur vehicula urna sit amet neque luctus, at efficitur quam dapibus.",
    },
    {
      img: "https://media.istockphoto.com/id/459292777/photo/laundry-service.jpg?s=612x612&w=0&k=20&c=V-fCS_ZhDA8_sqySt4-twQhovKdDrB9b71WBE_M6k1Q=",
      text: "Running Room Services",
      pg: "Curabitur vehicula urna sit amet neque luctus, at efficitur quam dapibus.",
    },
    {
      img: "https://media.istockphoto.com/id/459292777/photo/laundry-service.jpg?s=612x612&w=0&k=20&c=V-fCS_ZhDA8_sqySt4-twQhovKdDrB9b71WBE_M6k1Q=",
      text: "Mechanized Cleaning Services",
      pg: "Curabitur vehicula urna sit amet neque luctus, at efficitur quam dapibus.",
    },
    {
      img: "https://media.istockphoto.com/id/459292777/photo/laundry-service.jpg?s=612x612&w=0&k=20&c=V-fCS_ZhDA8_sqySt4-twQhovKdDrB9b71WBE_M6k1Q=",
      text: "Mechanized Cleaning Services",
      pg: "Curabitur vehicula urna sit amet neque luctus, at efficitur quam dapibus.",
    },
  ];

  const animationSides = ["fade-left", "fade-right", "fade-up", "fade-down"];

  return (
    <div className="container mx-auto p-9">
      <h2 className="text-3xl font-bold text-start mb-10 text-teal-500 font-space-grotesk ">
        Our Services
      </h2>
      <hr />
      <div className="mt-5">
        <h1 className="text-4xl mb-9 xl:mb-[13vh] font-bold">
          <span className="text-teal-500 font-space-grotesk">Delivering Superior</span> Laundry
          Services <br />
          & Cleaning <span className="text-teal-500">Services</span>
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 xl:gap-x-12 gap-y-[6vh]">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white overflow-hidden transition-shadow duration-300"
            data-aos={animationSides[index % animationSides.length]}
          >
            <div className="flex items-center justify-start mb-4 relative">
              <img
                src={service.img}
                alt={service.text}
                className="w-full h-auto object-cover rounded-sm"
              />
            </div>
            <div className="bg-teal-400 text-white relative w-80 lg:w-64 xl:w-96 h-36 bottom-12 p-3 opacity-80">
              <h3 className="text-xl font-semibold text-white mb-4 font-space-grotesk">
                {service.text}
              </h3>
              <p className="text-gray-100 text-xs mb-6 font-space-grotesk">{service.pg}</p>
              <button className="flex items-center justify-start gap-2 font-space-grotesk text-white px-4 transition-colors duration-300 border-b border-bg-white">
                Read more <FaArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
