import React from "react";
import Layout from "../components/layout/Layout";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaGlobe,
  FaClock,
  FaBuilding,
  FaExternalLinkAlt,
} from "react-icons/fa";

const Contact = () => {
  const contactDetails = [
    {
      icon: <FaMapMarkerAlt />,
      label: "OUR LOCATION",
      title: "Visit Our Office",
      description: "Tharu & Sons, Ernakulam, Kerala - 682030, India",
      action: "Get Directions",
      link: "https://www.google.com/maps/search/?api=1&query=Tharu+and+Sons+Ernakulam+Kerala",
      color: "bg-red-50 text-red-600",
    },
    {
      icon: <FaEnvelope />,
      label: "EMAIL US",
      title: "Let's Talk Business",
      description: "info@tharuandsons.in",
      action: "Send an Email",
      link: "mailto:info@tharuandsons.in",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: <FaPhoneAlt />,
      label: "CALL US",
      title: "Speak With Our Team",
      description: "+91 97450 35868",
      action: "Call Now",
      link: "tel:+919745035868",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <Layout title="Contact Us | Tharu & Sons">
      <main className="min-h-screen bg-[#fafafa] font-sans text-slate-800">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#111827]">
          <div className="absolute inset-0">
            <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-12 lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-red-300">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                We're Here to Help
              </div>

              <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Let's Start a
                <span className="mt-2 block text-red-500">
                  Conversation.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">
                Have a question or need assistance? The team at Tharu & Sons
                is ready to help. Reach out to us and we'll be happy to
                connect with you.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="mailto:info@tharuandsons.in"
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-900/30 transition hover:-translate-y-0.5 hover:bg-red-700"
                >
                  Contact Our Team
                  <FaArrowRight />
                </a>

                <a
                  href="tel:+919745035868"
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
                >
                  <FaPhoneAlt />
                  Call Us
                </a>
              </div>

              <div className="mt-10 flex items-center gap-3 text-sm text-slate-400">
                <FaGlobe className="text-red-400" />
                <span>Tharu & Sons · Kerala, India</span>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-red-500/20 to-orange-400/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
                <img
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85"
                  alt="Professional office workspace"
                  className="h-64 w-full rounded-[1.5rem] object-cover sm:h-80"
                />

                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-2xl text-white">
                      <FaBuilding />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Tharu & Sons
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">
                        Your trusted business partner
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-5">
                    <div className="flex items-start gap-3 text-slate-300">
                      <FaMapMarkerAlt className="mt-1 shrink-0 text-red-400" />
                      <p className="text-sm leading-6">
                        Ernakulam, Kerala
                        <br />
                        India - 682030
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:flex lg:-left-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-lg text-green-600">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    We're just an email away
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    info@tharuandsons.in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Details */}
        <section className="relative px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                Get In Touch
              </span>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                How Can We Help You?
              </h2>

              <p className="mt-4 leading-7 text-slate-500">
                Choose the most convenient way to reach us. We're happy to
                answer your questions and assist with your enquiries.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {contactDetails.map((item, index) => (
                <div
                  key={item.label}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-red-200 hover:shadow-xl hover:shadow-slate-200/60 sm:p-8"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl ${item.color} transition duration-300 group-hover:scale-110`}
                  >
                    {item.icon}
                  </div>

                  <p className="mt-6 text-xs font-bold tracking-[0.15em] text-slate-400">
                    {item.label}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 min-h-[48px] break-words text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <a
                    href={item.link}
                    target={item.label === "OUR LOCATION" ? "_blank" : undefined}
                    rel={
                      item.label === "OUR LOCATION"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="mt-6 inline-flex items-center gap-2 font-semibold text-red-600 transition hover:gap-3 hover:text-red-700"
                  >
                    {item.action}
                    <FaArrowRight className="text-xs" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business Hours / Closing CTA */}
        <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-red-500 shadow-xl shadow-red-900/10">
            <div className="grid gap-8 p-8 sm:p-10 md:grid-cols-[1fr_auto] md:items-center md:p-14">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-red-100">
                  <FaClock />
                  LET'S CONNECT
                </div>

                <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                  Have Something in Mind?
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-red-100">
                  We would love to hear from you. Get in touch with Tharu &
                  Sons today and let us help you with your enquiry.
                </p>
              </div>

              <a
                href="mailto:info@tharuandsons.in"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-white px-7 py-4 font-bold text-red-700 shadow-lg transition hover:-translate-y-1 hover:bg-red-50"
              >
                Send an Enquiry
                <FaExternalLinkAlt className="text-sm" />
              </a>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section className="border-t border-slate-200 bg-white px-5 py-6 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-slate-800">
              Tharu & Sons
            </span>
            . All rights reserved.
          </p>
        </section>
      </main>
    </Layout>
  );
};

export default Contact;