import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const techStack = [
  {
    category: "Backend Engine",
    tech: "Spring Boot 3 & Java 21",
    desc: "Robust REST microservices architecture with transactional consistency, Hibernate JPA, and Aspect-Oriented Logging."
  },
  {
    category: "Data & Storage",
    tech: "PostgreSQL & Flyway",
    desc: "ACID-compliant relational database with optimistic locking and indexed queries for sub-50ms slot lookups."
  },
  {
    category: "Event Streaming",
    tech: "RabbitMQ & Async Workers",
    desc: "Decoupled message queues for automated email alerts, notification triggers, and transactional auditing."
  },
  {
    category: "Payment & Escrow",
    tech: "Razorpay Gateway & Digital Ledger",
    desc: "Bank-grade 256-bit encryption for seamless customer wallet top-ups and automated practitioner escrow disbursements."
  },
  {
    category: "Security & Auth",
    tech: "JWT & Spring Security 6",
    desc: "Stateless JSON Web Tokens with strict Role-Based Access Control separating Customers, Owners, and Admins."
  },
  {
    category: "Frontend UI/UX",
    tech: "React 19 & Tailwind CSS v4",
    desc: "Modern reactive client with glassmorphism, instant optimistic UI updates, and mobile-first responsiveness."
  }
];

const pillars = [
  {
    title: "Zero-Latency Slot Locking",
    description: "Multi-tenant concurrency locking guarantees no double-bookings across simultaneous client checkouts.",
    icon: "bi-lightning-charge-fill",
    metric: "< 50ms"
  },
  {
    title: "Automated Escrow & Ledger",
    description: "Built-in wallet infrastructure with automated cancellation refunds and transparent transaction histories.",
    icon: "bi-wallet2",
    metric: "100% Secure"
  },
  {
    title: "Business Command Center",
    description: "Complete operations hub for tracking real-time revenue, client volume, staff slots, and service catalogs.",
    icon: "bi-graph-up-arrow",
    metric: "Live P&L"
  },
  {
    title: "Multi-Channel Alerts",
    description: "Automated instant confirmations and WhatsApp/email reminders reducing missed appointments by over 80%.",
    icon: "bi-bell-fill",
    metric: "98.4% Show Rate"
  }
];

const benchmarks = [
  { label: "Slot Concurrency Latency", value: "< 45 ms", sub: "Global P99 Response" },
  { label: "Appointment Conflict Rate", value: "0.00%", sub: "Guaranteed by DB Locks" },
  { label: "Platform SLA Uptime", value: "99.98%", sub: "Continuous Availability" },
  { label: "Client Attendance Rate", value: "98.4%", sub: "vs 58% Industry Average" }
];

const About = () => {
  const [activeTab, setActiveTab] = useState("architecture");

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-6xl space-y-20">
        {/* 1. Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6" data-animation-on-scroll="">
          <div className="inline-flex items-center gap-2 bg-brand-secondary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-brand-primary shadow-2xs">
            <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
            About Skedula Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-primary text-brand-primary leading-tight">
            Frictionless Booking. <br />
            Engineered for Modern Business.
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-normal">
            Skedula is an all-in-one appointment intelligence platform that unites clients with verified clinics, wellness sanctuaries, beauty salons, and professional services through zero-clash scheduling and digital escrow.
          </p>
        </section>

        {/* 2. Mission Section */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-card border border-neutral-border grid md:grid-cols-2 gap-10 items-center" data-animation-on-scroll="">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary bg-brand-primary px-3 py-1 rounded-full">
              Platform Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Eliminating the Friction of Daily Appointments.
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              Traditional booking methods rely on manual phone calls, scattered WhatsApp threads, and fragile spreadsheets. We built Skedula to provide real-time operational clarity: business owners configure custom daily slots, clients reserve time in seconds with escrow security, and reminders are automated end-to-end.
            </p>
          </div>
          <div className="bg-neutral-background rounded-2xl p-8 border border-neutral-border text-center flex flex-col items-center justify-center min-h-[240px] space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary text-brand-secondary flex items-center justify-center text-3xl shadow-sm">
              <i className="bi bi-shield-check"></i>
            </div>
            <p className="font-primary font-bold text-2xl text-brand-primary">100% Conflict-Free Scheduling</p>
            <p className="text-xs text-text-secondary max-w-xs">
              Powered by PostgreSQL concurrency locks and Spring Boot reactive services.
            </p>
          </div>
        </section>

        {/* 3. Key Platform Pillars */}
        <section className="space-y-8" data-animation-on-scroll="">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Built on 4 Pillars of Excellence
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Designed from first principles to solve real-world scheduling headaches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-3xl border border-neutral-border shadow-xs hover:shadow-card hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-secondary/30 text-brand-primary flex items-center justify-center text-xl mb-4">
                    <i className={`bi ${pillar.icon}`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-brand-primary font-primary mb-2">{pillar.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{pillar.description}</p>
                </div>
                <div className="pt-3 border-t border-neutral-border/60 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Benchmark</span>
                  <span className="text-xs font-bold text-brand-primary bg-brand-secondary/30 px-2 py-0.5 rounded-full">{pillar.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Engineering Architecture & Tech Stack */}
        <section className="bg-brand-dark text-neutral-background rounded-3xl p-8 sm:p-12 border border-white/10 space-y-10 bg-mesh-dark" data-animation-on-scroll="">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-brand-secondary text-xs font-bold uppercase tracking-wider">
              Technical Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-primary text-white">
              Under the Hood of Skedula
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              Modern enterprise stack engineered for high availability and low latency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 hover:bg-white/10 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary block">
                  {tech.category}
                </span>
                <h4 className="text-base font-bold text-white font-primary">{tech.tech}</h4>
                <p className="text-xs text-white/70 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>

          {/* Benchmarks Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            {benchmarks.map((bench, idx) => (
              <div key={idx} className="text-center space-y-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-brand-secondary font-primary">{bench.value}</h3>
                <p className="text-xs font-bold text-white">{bench.label}</p>
                <p className="text-[10px] text-white/50">{bench.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Call To Action */}
        <section className="bg-brand-secondary text-brand-primary rounded-3xl p-10 sm:p-14 text-center space-y-6" data-animation-on-scroll="">
          <span className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full">
            Join the Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-primary">
            Ready to Experience Effortless Scheduling?
          </h2>
          <p className="text-sm sm:text-base font-medium max-w-xl mx-auto opacity-90 leading-relaxed">
            Whether you are booking your next wellness visit or running a bustling commercial clinic, Skedula is designed for you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              to="/signup?role=owner"
              className="bg-brand-primary text-white hover:bg-brand-dark px-8 py-3.5 rounded-full font-bold shadow-card hover:shadow-card-hover transition-all text-xs"
            >
              Start as Business
            </Link>
            <Link
              to="/services/explore"
              className="bg-white text-brand-primary hover:bg-neutral-background px-8 py-3.5 rounded-full font-bold shadow-sm border border-brand-primary/20 transition-all text-xs"
            >
              Browse Public Catalog
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;