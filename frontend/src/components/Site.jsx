import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSpring, animated } from "react-spring";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaStar, FaUsers } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { ShieldCheck, UserCog } from "lucide-react";

import Layout from "../components/layout/Layout";
const images = [
  {
    src: "https://www.shutterstock.com/image-photo/cleaning-staff-clean-washing-subway-600nw-1689684643.jpg",
    text: "Mechanized Laundry Services",
  },
  {
    src: "https://thumbs.dreamstime.com/b/leipzig-germany-may-professional-clean-service-cleaning-up-train-trip-railway-station-174012329.jpg",
    text: "Bedroll Management Services",
  },
  {
    src: "https://t3.ftcdn.net/jpg/09/73/62/32/360_F_973623275_OtPSeVm7e8fomPiQ4pLHNjhzV4BxfNJD.jpg",
    text: "Housekeeping Services",
  },
  {
    src: "https://img.freepik.com/free-photo/subway-train-speeds-through-city-reflecting-modern-architecture-technology-generated-by-artificial-intelligence_188544-109856.jpg",
    text: "Running Room Services",
  },
];

const Site = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (auth?.user) {
  //     const { role } = auth.user;
  //     if (role === 1) navigate("/dashboard/manager");
  //     else if (role === 0) navigate("/dashboard/user");
  //     else {
  //       setAuth({ user: null, token: "" });
  //       localStorage.removeItem("auth");
  //       navigate("/login");
  //     }
  //   }
  // }, [auth, navigate, setAuth]);

useEffect(() => {
  if (auth?.user?.role === 1) {
    navigate("/dashboard/manager");
  } else if (auth?.user?.role === 0) {
    navigate("/dashboard/user");
  }
  // Remove the 'else' block that navigates to "/"
}, [auth?.user?.role, navigate]); // Only run when role changes

  const [currentIndex, setCurrentIndex] = useState(0);
  const satisfactionPercentage = 98;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    AOS.init({ duration: 1000 });
    return () => clearInterval(interval);
  }, []);

  // Animated Counters
  const workers = useSpring({ number: 120, from: { number: 0 }, config: { duration: 2000 } });
  const workDone = useSpring({ number: 600, from: { number: 0 }, config: { duration: 2000 } });
  const clients = useSpring({ number: 600, from: { number: 0 }, config: { duration: 2000 } });
  const states = useSpring({ number: 15, from: { number: 0 }, config: { duration: 2000 } });

  // Testimonials
  const testimonials = [
    {
      name: "John Doe",
      review:
        "Tharu & Sons provided exceptional service! My clothes have never looked better, and their punctuality is unmatched.",
      rating: 5,
    },
    {
      name: "Sarah Lee",
      review:
        "Impressed with the professionalism and quality. Laundry was fresh, clean, and perfectly pressed.",
      rating: 4,
    },
    {
      name: "Michael Smith",
      review:
        "Fantastic service! I’ll definitely use Tharu & Sons again. Their customer care is top-notch.",
      rating: 5,
    },
    {
      name: "Emily Davis",
      review:
        "Excellent cleaning service! My linens were spotless, and the team was very accommodating.",
      rating: 4,
    },
  ];

  const testimonialContainerRef = useRef(null);

  useEffect(() => {
    const container = testimonialContainerRef.current;
    let scrollPosition = 0;
    const scrollTestimonials = () => {
      if (container) {
        scrollPosition += 320;
        if (scrollPosition >= container.scrollWidth - container.clientWidth) scrollPosition = 0;
        container.scrollTo({ left: scrollPosition, behavior: "smooth" });
      }
    };
    const interval = setInterval(scrollTestimonials, 3000);
    return () => clearInterval(interval);
  }, [testimonials]);

  const faqs = [
    {
      question: "What services do Tharu & Sons offer?",
      answer:
        "We provide specialized services like mechanized laundry, linen management, onboard housekeeping, and more for Indian Railways and luxury hotels.",
    },
    {
      question: "Do you provide laundry services for hotels?",
      answer:
        "Yes, we specialize in offering laundry services for hotels, including luxury chains, ensuring high-quality linen management.",
    },
  ];

  return (
    <Layout title="Tharu and Sons">
      <div className="font-space-grotesk">
        {/* HERO SLIDER */}
        <div className="relative w-full h-[80vh] sm:h-screen overflow-hidden">
          <motion.div
            key={currentIndex}
            className="flex h-full w-full"
            initial={{ x: 0 }}
            animate={{ x: -currentIndex * 100 + "%" }}
            transition={{ duration: 0.8 }}
          >
            {images.map((item, i) => (
              <div key={i} className="relative min-w-full h-full">
                <img
                  src={item.src}
                  alt={item.text}
                  className="w-full h-full object-cover"
                />
                <motion.div
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="absolute top-1/2 left-4 sm:left-10 transform -translate-y-1/2 text-white p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-sm rounded-lg"
                >
                  <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-3 drop-shadow-lg">
                    {item.text}
                  </h2>
                  <button className="bg-teal-600 hover:bg-teal-700 px-4 sm:px-6 py-2 sm:py-3 rounded-md text-sm sm:text-base">
                    Learn More
                  </button>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>


<div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 max-w-4xl mx-auto -mt-10 relative z-10">
  <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Access</h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Use an array map for cleaner code */}
    {[
      { path: "/managerlogin", label: "Site Manager", sub: "Access manager dashboard", icon: UserCog, color: "teal" },
      { path: "/login", label: "Admin Panel", sub: "Secure administrator login", icon: ShieldCheck, color: "indigo" }
    ].map((item, idx) => (
      <Link key={idx} to={item.path} className={`flex items-center gap-3 p-4 bg-${item.color}-50 border border-${item.color}-200 rounded-xl hover:bg-${item.color}-100 transition`}>
        <item.icon className={`w-6 h-6 text-${item.color}-600`} />
        <div>
          <p className="font-semibold text-gray-800">{item.label}</p>
          <p className="text-sm text-gray-500">{item.sub}</p>
        </div>
      </Link>
    ))}
  </div>
</div>

        {/* ABOUT SECTION */}
        <section className="container mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-teal-500 mb-8 text-center sm:text-left">
            About Us
          </h1>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div data-aos="fade-right">
              <h2 className="text-2xl sm:text-3xl font-bold text-teal-500 mb-4">
                Tharu & Sons — Since 1998
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base">
                Tharu & Sons is a leading service provider of specialized services
                like mechanized laundry, linen management, onboard housekeeping,
                and more for Indian Railways and luxury hotels.
              </p>
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-teal-500 h-full text-white text-xs font-bold text-center"
                  style={{ width: `${satisfactionPercentage}%` }}
                >
                  {satisfactionPercentage}%
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-teal-500 text-2xl" />
                  <span className="text-gray-700 text-sm sm:text-base">
                    Professional Staff
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IoMdTime className="text-teal-500 text-2xl" />
                  <span className="text-gray-700 text-sm sm:text-base">
                    On-Time Service
                  </span>
                </div>
              </div>
            </div>
            <img
              src="https://images.crowdspring.com/blog/wp-content/uploads/2023/06/28162522/how-to-start-a-cleaning-business-hero.png"
              alt="Tharu & Sons team"
              className="rounded-lg shadow-lg w-full h-auto object-cover"
              data-aos="fade-up"
            />
          </div>
        </section>

        {/* PROGRESS SECTION */}
        <section className="bg-gray-50 py-10 sm:py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-500 mb-6">
            Our Progress
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 sm:px-8">
            {[
              { label: "Workers", value: workers },
              { label: "Total Work", value: workDone },
              { label: "Clients", value: clients },
              { label: "States", value: states },
            ].map((item, i) => (
              <div key={i}>
                <animated.h3 className="text-4xl sm:text-5xl w-full font-bold text-teal-500">
                  {item.value.number.to((n) => Math.floor(n))}
                </animated.h3>
                <p className="text-gray-700 text-sm sm:text-base">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY WE SECTION */}
        <section className="container mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl text-teal-500 mb-8 text-center font-bold">
            Why Choose Us?
          </h1>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src="https://jan-pro.ca/app/uploads/2023/10/Equipment-needed-VF-2880x1620-1-scaled.jpg"
              alt="Professional Cleaning Equipment"
              className="rounded-lg shadow-lg"
              data-aos="fade-down"
            />
            <div data-aos="fade-up">
              <p className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base">
                We offer unmatched quality and reliability in cleaning and laundry
                services, backed by experienced staff and modern equipment.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-white shadow rounded-lg">
                  <h3 className="font-semibold">Reliable & Trustworthy</h3>
                  <p className="text-sm text-gray-700">
                    High-quality services that meet your expectations every time.
                  </p>
                </div>
                <div className="p-4 bg-white shadow rounded-lg">
                  <h3 className="font-semibold">Customer Satisfaction</h3>
                  <p className="text-sm text-gray-700">
                    We prioritize customer happiness above all.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-teal-50 py-12 sm:py-16 px-4 sm:px-8 rounded-lg shadow-inner">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-teal-600 mb-2">
              What Our Clients Say
            </h1>
            <p className="text-gray-700 text-sm sm:text-base">
              Hear what our happy clients have to say:
            </p>
          </div>
          <div
            ref={testimonialContainerRef}
            className="flex overflow-x-auto gap-4 sm:gap-6 snap-x scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-teal-200"
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="testimonial bg-gradient-to-r from-teal-500 to-teal-300 p-6 sm:p-8 rounded-lg w-64 sm:w-80 snap-start text-center text-white flex-shrink-0"
              >
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, idx) => (
                    <FaStar
                      key={idx}
                      className={idx < t.rating ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <p className="italic mb-3 text-sm sm:text-base">{t.review}</p>
                <h2 className="font-semibold text-lg">{t.name}</h2>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="container mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-semibold text-teal-500 mb-8 text-center">
            Frequently Asked Questions
          </h1>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white shadow-lg p-6 rounded-lg">
                <h3 className="text-xl font-bold text-teal-600 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-700 text-sm sm:text-base">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Site;
