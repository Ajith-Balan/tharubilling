
import React, { useEffect } from "react";
import {
  FaUsers,
  FaTrain,
  FaCheckCircle,
  FaArrowRight,
  FaBuilding,
  FaHandshake,
  FaStar,
  FaShieldAlt,
  FaRegClock,
} from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import AOS from "aos";
import "aos/dist/aos.css";
import Layout from "../components/layout/Layout";

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 70,
    });
  }, []);

  const features = [
    {
      icon: <FaUsers />,
      title: "Professional Team",
      description:
        "Dedicated professionals committed to delivering reliable and quality services.",
    },
    {
      icon: <IoMdTime />,
      title: "Timely Service",
      description:
        "A strong focus on operational efficiency, consistency and timely delivery.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Quality & Reliability",
      description:
        "Professional service standards with attention to quality and customer needs.",
    },
    {
      icon: <FaHandshake />,
      title: "Trusted Partnerships",
      description:
        "Building lasting working relationships through commitment and service.",
    },
  ];

  const services = [
    "Mechanized laundry services",
    "Linen management",
    "Running room services",
    "Mechanized cleaning",
    "Onboard housekeeping services",
  ];

  return (
    <Layout title="About Us | Tharu & Sons">
      <main className="min-h-screen overflow-hidden bg-[#fafafa] font-sans text-slate-800">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#111827]">
          <div className="absolute inset-0">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-12 lg:py-24">
            <div data-aos="fade-right">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-red-300">
                <FaBuilding />
                About Tharu & Sons
              </div>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Built on Trust.
                <span className="mt-2 block text-red-500">
                  Driven by Service.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Since 1998, Tharu & Sons has been providing specialized
                operational services with a focus on quality, reliability
                and professional excellence.
              </p>

              <a
                href="/contact"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-red-600 px-6 py-4 font-semibold text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-1 hover:bg-red-700"
              >
                Get in Touch
                <FaArrowRight />
              </a>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <FaCheckCircle className="text-red-400" />
                  Quality Focused
                </span>
                <span className="flex items-center gap-2">
                  <FaCheckCircle className="text-red-400" />
                  Service Driven
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg" data-aos="fade-left">
              <div className="absolute -inset-4 rounded-[2rem] bg-red-500/15 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl">
                <img
                  src="https://images.crowdspring.com/blog/wp-content/uploads/2023/06/28162522/how-to-start-a-cleaning-business-hero.png"
                  alt="Professional cleaning and facility services"
                  className="h-72 w-full rounded-[1.5rem] object-cover sm:h-96"
                />

                <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/20 bg-slate-950/80 p-5 backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-8">
                  <p className="text-sm font-medium text-red-300">
                    OUR JOURNEY
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white">
                        Since 1998
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        Dedicated to service excellence
                      </p>
                    </div>
                    <FaStar className="mb-2 text-3xl text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Introduction */}
        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div data-aos="fade-up">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                Who We Are
              </span>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                A Legacy of Commitment and Excellence
              </h2>

              <div className="mt-6 h-1.5 w-20 rounded-full bg-red-600" />

              <p className="mt-6 leading-8 text-slate-600">
                Established in 1998, Tharu & Sons is a specialized service
                provider supporting railway operations and other
                organizations across India.
              </p>

              <p className="mt-4 leading-8 text-slate-600">
                Our services include fully mechanized laundry operations
                on a BOOT (Build-Own-Operate-Transfer) basis, linen
                management, running room services, mechanized cleaning
                and onboard housekeeping.
              </p>

              <p className="mt-4 leading-8 text-slate-600">
                We aim to build dependable partnerships through
                professional execution, consistent service delivery and
                a commitment to meeting the needs of the organizations
                we serve.
              </p>
            </div>

            <div
              className="grid gap-5 sm:grid-cols-2"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl ${
                    index % 2 === 1 ? "sm:translate-y-6" : ""
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                    {feature.icon}
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div data-aos="fade-right">
              <div className="overflow-hidden rounded-3xl bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85"
                  alt="Professional facility maintenance services"
                  className="h-72 w-full object-cover sm:h-96"
                  loading="lazy"
                />
              </div>
            </div>

            <div data-aos="fade-left">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                What We Do
              </span>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                Specialized Services. Professional Standards.
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                We provide a range of operational and support services
                designed to help organizations maintain clean, comfortable
                and efficiently managed environments.
              </p>

              <div className="mt-7 space-y-4">
                {services.map((service) => (
                  <div key={service} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs text-red-600">
                      <FaCheckCircle />
                    </span>
                    <span className="font-medium leading-6 text-slate-700">
                      {service}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="/contact"
                className="mt-9 inline-flex items-center gap-3 font-bold text-red-600 transition hover:gap-4 hover:text-red-700"
              >
                Discuss Your Requirements
                <FaArrowRight />
              </a>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div
            className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-red-500 px-7 py-12 shadow-xl shadow-red-900/10 sm:px-12 sm:py-14 lg:px-16"
            data-aos="fade-up"
          >
            <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[40px] border-white/10" />

            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-100">
                  Let's Work Together
                </p>

                <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                  Looking for a Reliable Service Partner?
                </h2>

                <p className="mt-4 leading-7 text-red-100">
                  Connect with Tharu & Sons to discuss your organization's
                  service requirements.
                </p>
              </div>

              <a
                href="/contact"
                className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-7 py-4 font-bold text-red-700 shadow-lg transition hover:-translate-y-1 hover:bg-red-50"
              >
                Contact Us
                <FaArrowRight />
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-slate-800">
              Tharu & Sons
            </span>
            . All rights reserved.
          </p>
        </footer>
      </main>
    </Layout>
  );
};

export default About;