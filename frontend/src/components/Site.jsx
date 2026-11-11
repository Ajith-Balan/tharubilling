import React, { useState, useEffect,useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  UserCog, 
  Users, 
  Clock, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Star, 
  ChevronDown, 
  Sparkles, 
  Building2, 
  TrendingUp, 
  MapPin, 
  Wrench,
  ArrowRight,
  Train,
  Droplets,
  PackageCheck,
  BedDouble,
  Sparkle,
  Flame,
  ShieldAlert,
  Layers,
  Thermometer,
  Zap,
  Activity,
  FileText,
  PhoneCall,
  ChevronDown as ArrowDown,
  
} from "lucide-react";
import Layout from "./layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";

const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1600",
    title: "Mechanized Railway Laundry",
    subtitle: "High-capacity automated washing & thermal sanitization for Indian Railways linens and bedsheets",
    tag: "BOOT LAUNDRY OPERATIONS",
    badgeColor: "border-red-500/40 bg-red-950/80 text-red-400"
  },
  {
    src: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=1600",
    title: "Bedroll & Linen Management",
    subtitle: "Hygienic 6-stage mechanized wash, eco-friendly folding, and tamper-evident packet sealing for train AC coaches",
    tag: "PAN-INDIA DISTRIBUTION",
    badgeColor: "border-blue-500/40 bg-blue-950/80 text-blue-300"
  },
  {
    src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1600",
    title: "Onboard Housekeeping (OBHS)",
    subtitle: "Real-time passenger issue resolution, automated cleaning logs, and dedicated train onboard crews",
    tag: "24/7 EN-ROUTE CARE",
    badgeColor: "border-red-500/40 bg-red-950/80 text-red-400"
  },
  {
    src: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=1600",
    title: "Running Room & Depot Services",
    subtitle: "End-to-end station, rake washing, pit line cleaning, and locomotive crew running room upkeep",
    tag: "RAILWAY CONTRACTOR SINCE 1998",
    badgeColor: "border-emerald-500/40 bg-emerald-950/80 text-emerald-300"
  }
];

const statsData = [
  { label: "Bedsheets Daily Processed", count: 180000, suffix: "+", icon: BedDouble, sub: "High-temp thermal washed" },
  { label: "Train Rakes Serviced", count: 420, suffix: "+ / Day", icon: Train, sub: "OBHS & Depot washing" },
  { label: "Certified Railway Staff", count: 3200, suffix: "+", icon: Users, sub: "Safety & hygiene trained" },
  { label: "Railway Divisions Covered", count: 24, suffix: " Divisions", icon: MapPin, sub: "Across Indian Railways" }
];

const bedrollPipeline = [
  {
    id: "collect",
    step: "01",
    title: "Depot & Rake Collection",
    desc: "Scheduled soiled linen retrieval from arriving AC rakes with barcoded batch tagging.",
    icon: Train,
    stats: "30 Mins Turnover"
  },
  {
    id: "wash",
    step: "02",
    title: "60°C Thermal Wash",
    desc: "Automated Tunnel Washer processing using bio-degradable, eco-friendly sanitizing detergents.",
    icon: Droplets,
    stats: "100% Germ Elimination"
  },
  {
    id: "iron",
    step: "03",
    title: "High-Speed Steam Ironing",
    desc: "Automatic flatwork ironers dry, press, and smooth bedsheets at high temperatures.",
    icon: Flame,
    stats: "Zero Moisture Residue"
  },
  {
    id: "pack",
    step: "04",
    title: "Sanitized Packet Sealing",
    desc: "Automatic mechanical folding and eco-bag vacuum sealing to eliminate contamination.",
    icon: PackageCheck,
    stats: "Tamper-Evident Packets"
  },
  {
    id: "dispatch",
    step: "05",
    title: "Coach Bedroll Loading",
    desc: "Timely dispatch directly into AC 1st, 2nd, and 3rd Tier coaches prior to passenger boarding.",
    icon: CheckCircle2,
    stats: "Strict Railway SLA"
  }
];

const railwayServices = [
  {
    id: "mechanized-laundry",
    title: "Mechanized Linen Laundry",
    desc: "BOOT (Build-Own-Operate-Transfer) high-capacity automated laundry units handling thousands of railway bedsheets, pillow covers, and blankets daily.",
    img: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=800",
    tag: "BOOT MODEL",
    features: ["Tunnel Washing Tech", "Thermal Sanitization", "Stain-Free Stain Removal", "Pillow & Blanket Care"]
  },
  {
    id: "obhs",
    title: "Onboard Housekeeping (OBHS)",
    desc: "In-transit train cleaning for long-distance trains and Vande Bharat expresses. Dedicated uniformed attendants equipped with modern cleaning tools.",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    tag: "LIVE TRAIN CARE",
    features: ["Passenger Request Response", "Bio-Toilet Cleaning", "Aisle & Doorway Sanitization", "Trash Management"]
  },
  {
    id: "rake-washing",
    title: "Depot & Rake Cleaning",
    desc: "Comprehensive mechanized exterior and interior wash for passenger coaches at railway depots, pit lines, and washing lines.",
    img: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=800",
    tag: "DEPOT OPERATIONS",
    features: ["High-Pressure Jet Wash", "Coach Disinfection", "Window Glass Polishing", "Cockroach & Pest Control"]
  },
  {
    id: "bedroll-mgmt",
    title: "Linen & Bedroll Packaging",
    desc: "End-to-end management of bedroll kits provided to AC passengers, ensuring freshly laundered, sealed, and soft linen kits.",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800",
    tag: "AC COACH LINEN",
    features: ["Hygienic Sealing Bags", "QR Inventory Tracking", "Quality Verification", "Zero-Touch Packing"]
  },
  {
    id: "running-room",
    title: "Running Room Services",
    desc: "Full facility maintenance for Loco Pilots and Guard running rooms, providing hygienic resting quarters, clean bedding, and catering upkeep.",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    tag: "CREW FACILITY",
    features: ["Loco Crew Rest Care", "Subsidized Kitchen Ops", "24/7 Room Sanitation", "Fresh Bedroll Supply"]
  },
  {
    id: "station-upkeep",
    title: "Station & Complex Cleaning",
    desc: "Mechanized floor scrubbing and platform sanitation for major railway junction stations, waiting halls, and executive lounges.",
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800",
    tag: "JUNCTION CARE",
    features: ["Ride-On Floor Scrubber", "Dust & Odor Control", "VIP Lounge Maintenance", "Waste Segregation"]
  }
];

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Sr. Divisional Mechanical Engineer (C&W)",
    org: "Northern Railway",
    review: "Tharu & Sons' mechanized laundry setup has drastically improved linen cleanliness for our premium trains. Their zero-delay dispatch ensures our bedroll logistics run flawlessly every day.",
    rating: 5,
    initials: "RS"
  },
  {
    name: "Ananya Deshmukh",
    role: "Divisional Operations Manager",
    org: "Central Railway",
    review: "The OBHS performance on our express routes managed by Tharu & Sons has received top passenger feedback scores. Response time to onboard complaints is impressive.",
    rating: 5,
    initials: "AD"
  },
  {
    name: "Michael D'Souza",
    role: "Depot In-Charge & SSE",
    org: "Southern Railway Hub",
    review: "Their BOOT laundry plant quality control and thermal bedsheets sanitization standards set a benchmark. They handle high peak-season volume effortlessly.",
    rating: 5,
    initials: "MD"
  },
  {
    name: "Suresh Menon",
    role: "Regional Running Room Inspector",
    org: "Western Railway",
    review: "Loco pilots and train guards have appreciated the drastic improvement in running room sanitation and bedroll cleanliness provided under Tharu & Sons contract.",
    rating: 5,
    initials: "SM"
  }
];

const faqs = [
  {
    q: "What specialized services does Tharu & Sons provide for Indian Railways?",
    a: "Tharu & Sons provides turnkey services including Mechanized Laundry Operations (BOOT model), Bedroll Management & Packaging for AC coaches, Onboard Housekeeping Services (OBHS), Depot Coach Washing & Pit Line Cleaning, and Running Room Facilities Management."
  },
  {
    q: "How does Tharu & Sons maintain bedsheet and linen hygiene for train passengers?",
    a: "We utilize industrial 60°C thermal washing, eco-friendly chemical dosing, high-speed steam ironing, and automated sealed packet packaging. Every batch undergoes stain detection and microbiological quality checks before being loaded onto train coaches."
  },
  {
    q: "Are your site managers and crews certified for railway operations?",
    a: "Yes. All our personnel undergo mandatory Indian Railways safety, hygiene, and chemical handling certifications. Our supervisors use live mobile logs to report cleaning statuses in real-time."
  },
  {
    q: "How can site supervisors and administrative officers log into their dashboards?",
    a: "Authorized personnel can use the quick access portal cards located directly beneath the Hero banner. Select either the 'Site Manager Portal' or 'Admin Panel' to proceed to login."
  },
  {
    q: "Do you operate mechanized laundry under the BOOT contract framework?",
    a: "Yes, we specialize in Build-Own-Operate-Transfer (BOOT) industrial mechanized laundries for Indian Railways divisions, delivering high daily output capacity with guaranteed SLA compliance."
  }
];

export default function App() {
  const [currentHero, setCurrentHero] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activePipelineStep, setActivePipelineStep] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Scroll header effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto Hero Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

    const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  
useEffect(() => {
  if (auth?.user?.role === 1) {
    navigate("/dashboard/manager");
  } else if (auth?.user?.role === 0) {
    navigate("/dashboard/user");
    } else if (auth?.user?.role === 2) {
    navigate("/dashboard/exp");
    }
  
  // Remove the 'else' block that navigates to "/"
}, [auth?.user?.role, navigate]); // Only run when role changes


  return (
    <Layout>

  
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      
      {/* TOP DECORATIVE BRAND STRIP (VANDE BHARAT / INDIAN RAILWAYS COLORS) */}
      {/* <div className="bg-gradient-to-r from-blue-900 via-blue-600 to-red-600 h-4 w-full fixed top-0 z-50 shadow-md"></div> */}

      {/* HEADER / NAVIGATION BAR */}
      <header className={`  left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-slate-500 backdrop-blur-lg border-b border-blue-900/40 shadow-xl " : "bg-gradient-to-b from-slate-950/80 to-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* BRAND LOGO */}
        

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8 text-xs lg:text-sm font-semibold tracking-wide text-slate-300">
            <a href="#about" className="hover:text-red-400 transition-colors">About</a>
            <a href="#services" className="hover:text-red-400 transition-colors">Railway Services</a>
            <a href="#pipeline" className="hover:text-red-400 transition-colors">Linen Process</a>
            <a href="#progress" className="hover:text-red-400 transition-colors">Performance</a>
            <a href="#testimonials" className="hover:text-red-400 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-red-400 transition-colors">FAQ</a>
          </nav>

          {/* QUICK CONTACT BADGE */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#portal"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-950/80 text-blue-300 border border-blue-700/60 hover:bg-blue-900/80 hover:border-red-500/50 transition flex items-center gap-2 shadow-inner"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Railway Portal Active
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 h-[90vh] min-h-[620px] max-h-[850px] overflow-hidden flex items-center">
        {/* Background Slider */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={heroImages[currentHero].src}
              alt={heroImages[currentHero].title}
              className="w-full h-full object-cover object-center"
            />
            {/* Deep Blue and Red Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-5 shadow-lg ${heroImages[currentHero].badgeColor}`}
            >
              <Train className="w-3.5 h-3.5 text-white" />
              {heroImages[currentHero].tag}
            </motion.div>

            {/* Title */}
            <motion.h1
              key={`title-${currentHero}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg"
            >
              {heroImages[currentHero].title.split(" ")[0]} {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-red-500">
                {heroImages[currentHero].title.split(" ").slice(1).join(" ")}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              key={`sub-${currentHero}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-slate-300 text-sm sm:text-lg max-w-2xl leading-relaxed font-normal"
            >
              {heroImages[currentHero].subtitle}
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-4 items-center"
            >
              <a
                href="#services"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold text-sm shadow-xl shadow-red-950/60 flex items-center gap-2 transition hover:scale-105 border border-red-500/30"
              >
                Our Railway Capabilities
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#pipeline"
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-blue-800/60 text-slate-200 font-semibold text-sm transition flex items-center gap-2"
              >
                <BedDouble className="w-4 h-4 text-blue-400" />
                Linen Packaging Process
              </a>
            </motion.div>
          </div>

          {/* Carousel Dots Indicator */}
          <div className="absolute bottom-4 right-4 sm:right-8 flex gap-2 z-20">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHero(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentHero === idx ? "w-8 bg-red-500" : "w-2.5 bg-slate-600 hover:bg-slate-400"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FLOATING QUICK ACCESS CARDS - SITE MANAGER & ADMIN PANEL */}
      <div id="portal" className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16">
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-blue-900/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-slate-800/80 gap-2">
            <div>
              <span className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Enterprise Access
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">Indian Railways Management & Admin Portal</h2>
            </div>
            <p className="text-xs text-slate-400">Authorized personnel secure login gateways</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Site Manager Access Card */}
            <a
              href="/managerlogin"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-950/90 via-slate-900 to-slate-900 p-5 border border-blue-800/60 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/60 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/25 transition-all" />
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-blue-900/60 text-blue-400 border border-blue-700/50 group-hover:bg-blue-600 group-hover:text-white transition duration-300 shrink-0">
                  <UserCog className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white group-hover:text-blue-300 transition text-base truncate">Daily Expense Management Portal</h3>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition shrink-0" />
                  </div>
                  {/* <p className="text-xs text-slate-400 mt-1 line-clamp-2">Linen inventory, OBHS logs, site staff shift scheduling & coach batch tracking</p> */}
                </div>
              </div>
            </a>

            {/* Administrator Access Card */}
            <a
              href="/login"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/50 p-5 border border-red-900/50 hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:shadow-red-950/60 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/25 transition-all" />
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-red-950/80 text-red-400 border border-red-800/60 group-hover:bg-red-600 group-hover:text-white transition duration-300 shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white group-hover:text-red-300 transition text-base truncate">Admin Panel</h3>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition shrink-0" />
                  </div>
                  {/* <p className="text-xs text-slate-400 mt-1 line-clamp-2">Division executive control, contract compliance, laundry telemetry & SLA analytics</p> */}
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ABOUT / CORPORATE OVERVIEW */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-blue-950 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Train className="w-3.5 h-3.5 text-blue-400" />
              Trusted Indian Railways Contractor Since 1998
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Pioneering High-Volume <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-red-500">
                Railway Cleaning & Bedroll Logistics
              </span>
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed text-sm sm:text-base">
              Tharu & Sons is a premier contracting firm specializing in automated mechanized laundry plants (BOOT model), bedroll kit preparation, onboard train housekeeping (OBHS), and comprehensive railway facility sanitation across major Indian Railways zones.
            </p>

            {/* Satisfaction Metric Bar */}
            <div className="mt-8 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-red-500" />
                  Railway Audit Compliance & Quality Score
                </span>
                <span className="text-sm font-extrabold text-red-500">99.2%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div className="bg-gradient-to-r from-blue-600 via-sky-400 to-red-500 h-full rounded-full transition-all duration-1000 w-[99.2%]" />
              </div>
              <p className="text-xs text-slate-400 mt-2">Verified through quarterly divisional mechanical audits and passenger feedback ratings.</p>
            </div>

            {/* Key Value Points */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-blue-900/40 flex items-start gap-3">
                <Droplets className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Industrial Washing Plants</h4>
                  <p className="text-xs text-slate-400 mt-1">High-capacity tunnel washers and steam ironers capable of 200,000+ linens daily.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-blue-900/40 flex items-start gap-3">
                <Clock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Strict Train Timelines</h4>
                  <p className="text-xs text-slate-400 mt-1">Zero-delay loading before train departures at primary origin depots and platforms.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Imagery */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-blue-900/50 shadow-2xl shadow-blue-950/40">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000"
                alt="Tharu and Sons Railway Laundry Plant"
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-slate-900/95 backdrop-blur-2xl border border-red-500/40 p-5 rounded-2xl shadow-2xl max-w-xs hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-950 text-red-400 rounded-xl border border-red-800 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">25+ Years</p>
                  <p className="text-xs text-slate-400">Excellence in Indian Railways Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LINEN & BEDROLL WASH PROCESS PIPELINE */}
      <section id="pipeline" className="py-24 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950 border-y border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkle className="w-3.5 h-3.5" />
              Mechanized Quality Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Railway Bedroll & Linen Wash Pipeline</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-3">From coach retrieval to thermal washing, steam pressing, and sealed bag distribution.</p>
          </div>

          {/* Step Selector Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {bedrollPipeline.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = activePipelineStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActivePipelineStep(idx)}
                  className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col justify-between ${
                    isActive
                      ? "bg-gradient-to-b from-blue-900/90 to-red-950/80 border-red-500 shadow-xl text-white"
                      : "bg-slate-900/70 border-slate-800 text-slate-400 hover:border-blue-700/60 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-black ${isActive ? "text-red-400" : "text-slate-500"}`}>
                      STEP {step.step}
                    </span>
                    <StepIcon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  </div>
                  <p className="font-bold text-xs sm:text-sm line-clamp-1">{step.title}</p>
                </button>
              );
            })}
          </div>

          {/* Active Step Detailed Card */}
          <div className="bg-slate-900/90 border border-blue-800/60 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <span className="text-xs font-black text-blue-400 uppercase tracking-widest">
                  Stage {bedrollPipeline[activePipelineStep].step} of 05
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {bedrollPipeline[activePipelineStep].title}
                </h3>
                <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                  {bedrollPipeline[activePipelineStep].desc}
                </p>

                <div className="mt-6 flex items-center gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 w-fit">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Standard KPI Guarantee</span>
                    <span className="text-sm font-bold text-white">{bedrollPipeline[activePipelineStep].stats}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Key Quality Controls</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Strict pH and bio-chemical residual testing on washed fabric
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Automated optical sensors for stain or tear detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Tamper-resistant poly-wrap seal protecting bedsheets from dust during transit
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS COUNTER SECTION */}
      <section id="progress" className="py-20 bg-slate-950 border-b border-blue-900/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Scale & Operations</span>
            <h2 className="text-3xl font-black text-white mt-1">Daily Railway Operational Reach</h2>
            <div className="w-16 h-1 bg-red-600 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsData.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 hover:border-blue-600/60 p-6 rounded-2xl text-center group transition duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 rounded-full blur-xl group-hover:bg-red-600/10 transition-all" />
                  <div className="inline-flex p-3 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/50 mb-4 group-hover:text-red-400 group-hover:bg-red-950 group-hover:border-red-800 transition duration-300">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {stat.count.toLocaleString()}{stat.suffix}
                  </h3>
                  <p className="text-sm font-semibold text-slate-300 mt-2">{stat.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RAILWAY SERVICES SECTION */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Contract Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Specialized Railway Services</h2>
          <p className="text-slate-400 text-sm mt-3">Delivering automated high-capacity solutions tailored to Indian Railways divisions.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {railwayServices.map((service) => (
            <div
              key={service.id}
              className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden group hover:border-red-500/60 transition-all duration-300 hover:-translate-y-1.5 flex flex-col shadow-lg"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={service.img}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-red-400 tracking-wider">
                  {service.tag}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">{service.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{service.desc}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Service Highlights</span>
                    <div className="flex flex-wrap gap-1.5">
                      {service.features.map((feat, fIdx) => (
                        <span key={fIdx} className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-900/60 text-[10px] text-blue-300 font-medium">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    IR Compliant SLA
                  </span>
                  <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLIENT TESTIMONIALS */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Official Feedback</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">Trusted By Railway Officers & Engineers</h2>
            </div>
            <p className="text-xs text-slate-400 mt-2 md:mt-0 max-w-md">
              Feedback from Senior Mechanical Engineers and Operations Managers across Indian Railways.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-blue-600/50 transition duration-300"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">"{t.review}"</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-red-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{t.name}</h4>
                    <p className="text-[11px] text-blue-400 font-medium">{t.role}</p>
                    <p className="text-[10px] text-slate-500">{t.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Railways Contracting FAQ</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-white font-semibold text-sm sm:text-base focus:outline-none hover:text-red-400 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                    activeFaq === idx ? "rotate-180 text-red-500" : ""
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-blue-950 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-900">
            
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-red-600 flex items-center justify-center font-black text-lg text-white">
                  <Train className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white tracking-tight">
                  THARU <span className="text-red-500">& SONS</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-4 max-w-sm leading-relaxed">
                Empowering Indian Railways with high-volume mechanized laundry, AC bedroll packet distribution, onboard train housekeeping (OBHS), and running room sanitation since 1998.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Railway Navigation</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#about" className="hover:text-white transition">About Contracting Firm</a></li>
                <li><a href="#services" className="hover:text-white transition">Railway Services</a></li>
                <li><a href="#pipeline" className="hover:text-white transition">Linen Wash Pipeline</a></li>
                <li><a href="#progress" className="hover:text-white transition">Divisional Reach</a></li>
              </ul>
            </div>

            {/* Direct Portal Access Links */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Enterprise Access</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a href="/managerlogin" className="hover:text-blue-400 transition flex items-center gap-1.5">
                    <UserCog className="w-3.5 h-3.5 text-blue-400" />
                    Site Manager Login
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:text-red-400 transition flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                    Admin Panel Login
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Tharu & Sons. Indian Railways Service Contractor.</p>
            <p className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-blue-950 border border-blue-900 text-[10px] text-blue-300 font-bold">
                ISO 9001:2015 REGISTERED
              </span>
            </p>
          </div>
        </div>
      </footer>

    </div>
      </Layout>
  );
}