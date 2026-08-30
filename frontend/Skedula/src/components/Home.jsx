import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./Auth/AuthContext";

const categories = [
  { id: "all", name: "All Categories", icon: "bi-grid-fill" },
  { id: "wellness", name: "Wellness & Spa", icon: "bi-flower1", count: "1,420+ Services" },
  { id: "clinics", name: "Medical & Clinics", icon: "bi-heart-pulse", count: "890+ Doctors" },
  { id: "beauty", name: "Salons & Aesthetics", icon: "bi-scissors", count: "2,100+ Stylists" },
  { id: "auto", name: "Auto & Detailing", icon: "bi-car-front", count: "650+ Garages" },
  { id: "consulting", name: "Executive Consulting", icon: "bi-briefcase", count: "480+ Experts" },
  { id: "studios", name: "Creative Studios", icon: "bi-camera-reels", count: "320+ Venues" }
];

const features = [
  {
    title: "Zero-Latency Slot Locking",
    tag: "Concurrency Safe",
    badge: "100% Conflict Free",
    description: "Multi-tenant concurrency locking guarantees no double-bookings across simultaneous client checkouts.",
    icon: "bi-lightning-charge",
    rating: "5.0",
    reviews: "1,850",
    metric: "< 50ms Reservation"
  },
  {
    title: "Escrow & Instant Refunds",
    tag: "Financial Security",
    badge: "Razorpay Protected",
    description: "Automated wallet balances and protected escrow payments with instant automated refunds upon approved cancellation.",
    icon: "bi-shield-check",
    rating: "4.9",
    reviews: "2,400",
    metric: "100% Guaranteed"
  },
  {
    title: "Omnichannel Notifications",
    tag: "Attendance Booster",
    badge: "98.4% Show Rate",
    description: "Automated SMS, email, and calendar dispatching to eliminate client no-shows and keep slots fully utilized.",
    icon: "bi-bell",
    rating: "5.0",
    reviews: "920",
    metric: "Zero Dropoffs"
  },
  {
    title: "Business Intelligence",
    tag: "Owner Suite",
    badge: "Real-time Metrics",
    description: "Comprehensive analytics on slot utilization, revenue growth, unique clients served, and peak booking hours.",
    icon: "bi-graph-up-arrow",
    rating: "4.9",
    reviews: "1,150",
    metric: "Live P&L Ledger"
  }
];

const stats = [
  { value: "10K+", label: "Verified Businesses", sub: "Active Registered Hubs" },
  { value: "50K+", label: "Happy Clients", sub: "Frictionless Bookings" },
  { value: "100K+", label: "Appointments Completed", sub: "Zero Calendar Clashes" },
  { value: "99.98%", label: "Platform SLA Uptime", sub: "Enterprise Reliability" }
];

const testimonials = [
  {
    name: "Dr. Ananya Sharma",
    role: "Medical Director, Arya Dermatology & Aesthetics",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80",
    text: "Before Skedula, our reception staff spent 3 hours daily managing appointments and cancellations over calls. Now, our schedule is 100% automated with zero booking clashes, and client no-shows dropped to nearly zero."
  },
  {
    name: "Vikramaditya Roy",
    role: "Founder & Master Stylist, Atelier Hair Sanctuary",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    text: "The digital wallet integration is game-changing. Clients love the one-click deposits and transparent slot visibility. Our weekly revenue increased by 35% within the first 60 days of onboarding."
  },
  {
    name: "Elena Rostova",
    role: "Operations Head, Aura Holistic Wellness",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    text: "The editorial interface is gorgeous and represents our brand aesthetic perfectly. It takes our clients under 30 seconds to choose a practitioner, pick a slot, and receive instant confirmation."
  }
];

const faqs = [
  {
    q: "How does the Skedula slot reservation engine prevent double booking?",
    a: "Skedula uses backend transaction isolation and atomic concurrency locking in PostgreSQL. When a client begins scheduling a slot, that interval is locked in real-time, preventing any other user from booking the identical time frame."
  },
  {
    q: "How does the Digital Wallet and Escrow payment system work?",
    a: "Clients can deposit funds securely via Razorpay into their Skedula wallet. When an appointment is scheduled, funds are held in secure escrow. If an appointment is cancelled within the allowed window, refunds are instantly credited back to the customer's wallet balance."
  },
  {
    q: "Can businesses configure custom operating hours and multiple service tiers?",
    a: "Yes! Business owners can specify opening and closing times, register individual services with custom durations (from 15 to 180 minutes), set daily slot caps, and upload custom cover imagery."
  },
  {
    q: "How do I register my business on Skedula?",
    a: "Sign up as a 'Business Owner', navigate to 'Register Business', fill in your business identity, operating hours, GST/CRN details, and Google Maps location link. You can immediately publish services and receive customer appointments."
  }
];

const Home = () => {
  const navigate = useNavigate();
  const { isOwner, isAuthenticated } = useContext(AuthContext);

  // Interactive ROI Calculator State
  const [monthlyBookings, setMonthlyBookings] = useState(120);
  const [avgServicePrice, setAvgServicePrice] = useState(850);
  const hoursSaved = Math.round((monthlyBookings * 12) / 60);
  const recoveredRevenue = Math.round(monthlyBookings * 0.18 * avgServicePrice);

  // Active Category State
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="overflow-x-hidden bg-mesh-subtle">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 overflow-hidden">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="relative z-10 space-y-6" data-animation-on-scroll="">
            <div className="inline-flex items-center gap-2 bg-brand-secondary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-brand-primary shadow-2xs">
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
              Modern Business & Appointment Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-primary leading-[1.08] text-brand-primary">
              Schedule Smarter. <br />
              Grow with <span className="relative inline-block">
                Precision.
                <span className="absolute -top-3 -right-6 text-brand-secondary">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"></path>
                  </svg>
                </span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary max-w-lg leading-relaxed font-normal">
              Eliminate phone tag, double-bookings, and manual spreadsheets. Skedula bridges verified service providers and clients with real-time slot synchronization, digital wallet escrow, and automated reminders.
            </p>

            {/* Hero Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                isOwner ? (
                  <>
                    <button
                      onClick={() => navigate("/businesses")}
                      className="bg-brand-primary text-white hover:bg-brand-dark px-8 py-3.5 rounded-full font-bold shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <i className="bi bi-building"></i>
                      <span>My Business Hub</span>
                    </button>
                    <button
                      onClick={() => navigate("/appointments")}
                      className="bg-white text-brand-primary hover:bg-neutral-background px-7 py-3.5 rounded-full font-bold shadow-sm hover:shadow border border-neutral-border transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <i className="bi bi-calendar-check text-emerald-700"></i>
                      <span>Manage Bookings</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/services/explore")}
                      className="bg-brand-primary text-white hover:bg-brand-dark px-8 py-3.5 rounded-full font-bold shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <i className="bi bi-compass"></i>
                      <span>Explore Services</span>
                    </button>
                    <button
                      onClick={() => navigate("/appointments")}
                      className="bg-white text-brand-primary hover:bg-neutral-background px-7 py-3.5 rounded-full font-bold shadow-sm hover:shadow border border-neutral-border transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <i className="bi bi-calendar-check"></i>
                      <span>My Appointments</span>
                    </button>
                  </>
                )
              ) : (
                <>
                  <button
                    onClick={() => navigate("/services/explore")}
                    className="bg-brand-primary text-white hover:bg-brand-dark px-8 py-3.5 rounded-full font-bold shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Browse Services</span>
                    <i className="bi bi-arrow-right text-brand-secondary"></i>
                  </button>
                  <button
                    onClick={() => navigate("/signup?role=owner")}
                    className="bg-white text-brand-primary hover:bg-neutral-background px-7 py-3.5 rounded-full font-bold shadow-sm hover:shadow border border-neutral-border transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <i className="bi bi-briefcase text-brand-primary"></i>
                    <span>Register as Business</span>
                  </button>
                </>
              )}
            </div>

            {/* Social Proof Badges */}
            <div className="pt-3 flex items-center gap-3">
              <div className="flex -space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80"
                  className="w-10 h-10 rounded-full border-2 border-neutral-background object-cover"
                  alt="Client Avatar"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80"
                  className="w-10 h-10 rounded-full border-2 border-neutral-background object-cover"
                  alt="Client Avatar"
                />
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=64&h=64&q=80"
                  className="w-10 h-10 rounded-full border-2 border-neutral-background object-cover"
                  alt="Client Avatar"
                />
              </div>
              <div>
                <div className="flex text-amber-500 text-xs">
                  {"★★★★★".split("").map((star, idx) => (
                    <span key={idx}>{star}</span>
                  ))}
                </div>
                <span className="text-xs font-bold text-brand-primary">
                  Rated 4.9/5 by 50,000+ happy clients & businesses
                </span>
              </div>
            </div>
          </div>

          {/* Right Product Composition Visual */}
          <div className="relative z-0 mt-8 md:mt-0 flex justify-center" data-animation-on-scroll="">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-secondary/15 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

            <div className="relative w-full max-w-md aspect-[4/5] flex items-center justify-center">
              {/* Main Interactive Live Card */}
              <div className="w-full h-auto bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-border/80 flex flex-col justify-between animation-float relative z-20 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-brand-secondary font-bold text-sm">
                      S
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-primary leading-tight">Live Slot Manager</h4>
                      <p className="text-[10px] text-text-secondary">Smart Concurrency v2.0</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                    Live Sync
                  </span>
                </div>

                {/* Simulated Live Appointments List */}
                <div className="space-y-2.5">
                  <div className="p-3 bg-neutral-background rounded-2xl border border-neutral-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <div>
                        <p className="font-bold text-xs text-brand-primary">Full Wellness Session</p>
                        <p className="text-[10px] text-text-secondary">Today • 02:30 PM • 60 Mins</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-primary">₹750.00</span>
                  </div>

                  <div className="p-3.5 bg-brand-primary text-white rounded-2xl shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <i className="bi bi-check-circle-fill text-brand-secondary text-base"></i>
                      <div>
                        <p className="font-bold text-xs text-white">Hair Sanctuary & Styling</p>
                        <p className="text-[10px] text-white/70">Tomorrow • 11:00 AM</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-brand-secondary text-brand-primary px-2 py-0.5 rounded-full uppercase">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-background rounded-2xl border border-neutral-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <div>
                        <p className="font-bold text-xs text-brand-primary">Clinical Consultation</p>
                        <p className="text-[10px] text-text-secondary">Friday • 04:00 PM</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-primary">₹1,200.00</span>
                  </div>
                </div>

                {/* Card Security Footprint */}
                <div className="pt-2 border-t border-neutral-border/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-text-secondary">Instant SMS & WhatsApp Alerts</span>
                  <span className="font-bold text-brand-primary text-[11px] flex items-center gap-1">
                    <i className="bi bi-shield-check text-emerald-700"></i> Escrow Secured
                  </span>
                </div>
              </div>

              {/* Floating Mini Escrow Card */}
              <div className="absolute -bottom-5 -right-4 p-4 bg-brand-dark text-white rounded-2xl shadow-xl z-30 border border-white/10 rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[10px] text-brand-secondary uppercase font-bold tracking-wider">Escrow Balance</span>
                  <i className="bi bi-wallet2 text-xs text-brand-secondary"></i>
                </div>
                <div className="text-xl font-bold font-primary text-white">₹14,850.00</div>
                <p className="text-[9px] text-white/60 mt-0.5">Automated Razorpay Payouts</p>
              </div>

              {/* Floating Zero Clash Pill */}
              <div className="absolute -top-4 -left-4 bg-brand-accent text-brand-primary text-xs font-bold px-4 py-2 rounded-2xl -rotate-3 shadow-lg z-30 flex items-center gap-1.5 border border-black/5">
                <i className="bi bi-lightning-charge-fill text-brand-primary"></i>
                <span>Zero Double Booking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Category Directory Explorer */}
      <section className="py-16 px-4 sm:px-6 bg-white border-y border-neutral-border/60">
        <div className="container mx-auto max-w-6xl space-y-8" data-animation-on-scroll="">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Ecosystem Directory
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-primary text-brand-primary mt-1">
                Explore Services Across Industries
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Verified clinics, salons, wellness sanctuaries, and expert consultancies.
              </p>
            </div>

            <Link
              to="/services/explore"
              className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 self-start md:self-auto"
            >
              <span>View All 5,000+ Services</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {/* Category Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.slice(1).map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/services/explore`)}
                className="bg-neutral-background hover:bg-brand-secondary/20 border border-neutral-border/80 hover:border-brand-primary/40 rounded-2xl p-4 text-center transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-brand-primary group-hover:scale-110 flex items-center justify-center text-lg mx-auto shadow-2xs transition-transform mb-2">
                  <i className={`bi ${cat.icon}`}></i>
                </div>
                <h4 className="text-xs font-bold text-brand-primary group-hover:text-brand-dark transition-colors truncate">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-text-secondary mt-0.5">{cat.count}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Dark Forest Feature Intelligence Grid */}
      <section className="bg-brand-dark text-neutral-background py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden bg-mesh-dark">
        <div className="container mx-auto max-w-6xl space-y-16">
          <div className="grid md:grid-cols-2 gap-10 items-end" data-animation-on-scroll="">
            <div>
              <span className="text-brand-secondary text-xs font-bold uppercase tracking-wider block mb-2">
                High-Reliability Architecture
              </span>
              <h2 className="text-3xl md:text-5xl font-bold font-primary leading-tight text-white">
                Engineered for Zero Downtime & Maximum Efficiency.
              </h2>
            </div>
            <div className="text-left md:text-right">
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3">
                No lost appointments. No double-bookings. Complete transparency for both clients and owners.
              </p>
              <Link
                to="/businesses/explore"
                className="inline-flex items-center gap-1.5 text-brand-secondary hover:underline text-xs font-bold"
              >
                <span>Browse Verified Business Directory</span>
                <i className="bi bi-arrow-up-right"></i>
              </Link>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-brand-primary/90 backdrop-blur-md rounded-3xl p-6 hover:bg-brand-hover transition-all duration-300 group border border-white/10 flex flex-col justify-between space-y-6"
                data-animation-on-scroll=""
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {feature.badge}
                    </span>
                    <span className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">
                      {feature.tag}
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-brand-secondary text-2xl group-hover:scale-110 transition-transform mb-4">
                    <i className={`bi ${feature.icon}`}></i>
                  </div>

                  <h3 className="text-lg font-bold font-primary text-white mb-2">{feature.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{feature.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-brand-secondary">{feature.metric}</span>
                  <button
                    onClick={() => navigate("/services/explore")}
                    className="bg-white text-brand-primary text-[11px] font-bold px-3.5 py-1.5 rounded-full hover:bg-brand-secondary transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-white/10">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center" data-animation-on-scroll="">
                <h3 className="text-3xl md:text-5xl font-bold text-brand-secondary font-primary mb-1">
                  {stat.value}
                </h3>
                <p className="font-bold text-xs sm:text-sm text-white">{stat.label}</p>
                <p className="text-[10px] sm:text-xs text-white/50">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Interactive ROI & Booking Efficiency Calculator */}
      <section className="py-20 px-4 sm:px-6 bg-neutral-background">
        <div className="container mx-auto max-w-5xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3" data-animation-on-scroll="">
            <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Business Value Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Calculate Your Operational Gains
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              See how much time and lost revenue Skedula saves your business each month by eliminating scheduling chaos and no-shows.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-border shadow-card grid md:grid-cols-2 gap-10 items-center" data-animation-on-scroll="">
            {/* Sliders Column */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Monthly Appointments
                  </label>
                  <span className="text-base font-bold font-primary text-brand-primary">{monthlyBookings} Bookings</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={monthlyBookings}
                  onChange={(e) => setMonthlyBookings(Number(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-secondary mt-1">
                  <span>20 / mo</span>
                  <span>500 / mo</span>
                  <span>1000+ / mo</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Average Service Ticket Price (₹)
                  </label>
                  <span className="text-base font-bold font-primary text-brand-primary">₹{avgServicePrice}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="50"
                  value={avgServicePrice}
                  onChange={(e) => setAvgServicePrice(Number(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-secondary mt-1">
                  <span>₹200</span>
                  <span>₹2,500</span>
                  <span>₹5,000+</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-background rounded-2xl border border-neutral-border/60 text-xs space-y-1">
                <p className="font-bold text-brand-primary flex items-center gap-1.5">
                  <i className="bi bi-info-circle text-emerald-700"></i>
                  Based on verified marketplace metrics
                </p>
                <p className="text-[11px] text-text-secondary">
                  Calculated from an average 12 minutes saved per booking coordination and an industry average 18% recovered attendance.
                </p>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="bg-brand-primary text-white rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider block">
                    Admin Time Saved Monthly
                  </span>
                  <div className="text-4xl sm:text-5xl font-bold font-primary text-white mt-1">
                    ~{hoursSaved} <span className="text-2xl font-normal text-white/80">Hours</span>
                  </div>
                  <p className="text-xs text-white/70 mt-1">Direct staff hours saved from manual phone coordination</p>
                </div>

                <hr className="border-white/10" />

                <div>
                  <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider block">
                    Estimated Recovered Revenue
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold font-primary text-brand-secondary mt-1">
                    +₹{recoveredRevenue.toLocaleString("en-IN")} <span className="text-lg font-normal text-white/80">/ mo</span>
                  </div>
                  <p className="text-xs text-white/70 mt-1">From automated reminders & reduced empty slot no-shows</p>
                </div>
              </div>

              <button
                onClick={() => navigate("/signup?role=owner")}
                className="w-full bg-brand-secondary text-brand-primary hover:bg-white py-3.5 rounded-full text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Onboard Your Business Free</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Authentic Testimonials Spotlight */}
      <section className="bg-white py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3" data-animation-on-scroll="">
            <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Verified Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Trusted by Hundreds of Practitioners
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Real feedback from clinic directors, spa owners, and boutique service providers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="bg-neutral-background p-8 rounded-3xl border border-neutral-border flex flex-col justify-between shadow-xs hover:shadow-card hover:-translate-y-1 transition-all space-y-6"
                data-animation-on-scroll=""
              >
                <div>
                  <div className="flex text-amber-500 text-xs mb-3">
                    {"★★★★★"}
                  </div>
                  <blockquote className="text-brand-primary text-xs sm:text-sm leading-relaxed italic">
                    "{test.text}"
                  </blockquote>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-neutral-border/60">
                  <img
                    src={test.image}
                    alt={test.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-brand-primary">{test.name}</h5>
                    <p className="text-[10px] text-text-secondary">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Interactive FAQ Accordion */}
      <section className="py-20 px-4 sm:px-6 bg-neutral-background">
        <div className="container mx-auto max-w-4xl space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3" data-animation-on-scroll="">
            <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Everything You Need to Know
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Answers regarding our scheduling engine, escrow guarantee, and business onboarding.
            </p>
          </div>

          <div className="space-y-4" data-animation-on-scroll="">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-border/80 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm text-brand-primary hover:bg-neutral-background/50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <i className={`bi bi-chevron-${openFaq === idx ? 'up' : 'down'} text-xs text-text-secondary`}></i>
                </button>

                {openFaq === idx && (
                  <div className="px-6 pb-5 text-xs text-text-secondary leading-relaxed border-t border-neutral-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call To Action Conversion Strip */}
      <section className="py-20 px-4 sm:px-6 bg-brand-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(185,233,89,0.15),transparent_60%)]"></div>

        <div className="container mx-auto text-center max-w-3xl space-y-6 relative z-10" data-animation-on-scroll="">
          <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
            Instant Onboarding
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold font-primary leading-tight text-white">
            Ready to Modernize Your Appointment Flow?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Join thousands of modern businesses and clients who experience calm, frictionless scheduling every single day.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-3">
            <button
              onClick={() => navigate("/signup?role=owner")}
              className="bg-brand-secondary text-brand-primary hover:bg-white px-8 py-3.5 rounded-full font-bold shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all text-xs cursor-pointer"
            >
              Register Business Free
            </button>
            <button
              onClick={() => navigate("/services/explore")}
              className="bg-white/10 text-white hover:bg-white hover:text-brand-primary px-8 py-3.5 rounded-full font-bold border border-white/20 transition-all text-xs cursor-pointer"
            >
              Browse Client Services
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;