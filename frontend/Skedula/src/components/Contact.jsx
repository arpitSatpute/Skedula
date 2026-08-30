import React, { useState } from 'react';
import { FaEnvelope, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { toast } from 'react-toastify';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'General Support',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const socialLinks = [
    {
      icon: <FaEnvelope className="text-xl" />,
      label: "Email Support",
      value: "arpitrameshsatpute6986@gmail.com",
      link: "mailto:arpitrameshsatpute6986@gmail.com",
    },
    {
      icon: <FaLinkedin className="text-xl" />,
      label: "LinkedIn",
      value: "arpitsatpute",
      link: "https://www.linkedin.com/in/arpitsatpute/",
    },
    {
      icon: <FaGithub className="text-xl" />,
      label: "GitHub Repository",
      value: "github.com/arpitSatpute",
      link: "https://github.com/arpitSatpute",
    },
    {
      icon: <FaXTwitter className="text-xl" />,
      label: "Twitter / X",
      value: "@arpit_jsx",
      link: "https://x.com/arpit_jsx",
    },
    {
      icon: <FaInstagram className="text-xl" />,
      label: "Instagram",
      value: "@arpits_15",
      link: "https://www.instagram.com/arpits_15/",
    }
  ];

  const projectDetails = [
    {
      icon: "bi-github",
      label: "Open Source Core",
      value: "github.com/arpitSatpute/Skedula",
      link: "https://github.com/arpitSatpute/Skedula",
    },
    {
      icon: "bi-layers",
      label: "Frontend Stack",
      value: "React 19, Tailwind CSS v4, Lucide & Bootstrap Icons",
    },
    {
      icon: "bi-hdd-network",
      label: "Backend Architecture",
      value: "Spring Boot 3, PostgreSQL, RabbitMQ, JWT",
    },
    {
      icon: "bi-credit-card-2-front",
      label: "Payment & Escrow",
      value: "Razorpay Standard Gateway & Digital Wallet API",
    },
    {
      icon: "bi-shield-check",
      label: "Security Standard",
      value: "256-bit TLS Encryption, Role-Based Access Control",
    },
    {
      icon: "bi-patch-check",
      label: "System Edition",
      value: "v2.0 Flora & Ether Production Release",
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.warn('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success('Thank you! Your message has been routed to our team.');
    }, 800);
  };

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-6xl space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4" data-animation-on-scroll="">
          <div className="inline-flex items-center gap-2 bg-brand-secondary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-brand-primary shadow-2xs">
            <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
            Contact & Enterprise Inquiries
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-primary text-brand-primary">
            Connect With Our Team.
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Have questions about onboarding your business, custom integrations, or platform features? We're here to help.
          </p>
        </div>

        {/* 2 Column Layout: Interactive Form + Contact Info */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Form Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-6" data-animation-on-scroll="">
            <div className="border-b border-neutral-border/60 pb-4">
              <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Direct Inquiries
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-primary text-brand-primary mt-1">
                Send a Message
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                We generally respond within 2-4 business hours.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl mx-auto shadow-sm">
                  <i className="bi bi-check-lg"></i>
                </div>
                <h4 className="text-xl font-bold font-primary text-brand-primary">Message Sent Successfully!</h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Thank you, <strong>{formData.name}</strong>. A confirmation has been logged and our engineering team will get back to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', topic: 'General Support', subject: '', message: '' });
                  }}
                  className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:bg-brand-dark transition-all cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Maya Chen"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="maya@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all cursor-pointer"
                    >
                      <option value="General Support">General Support</option>
                      <option value="Business Onboarding">Business Onboarding</option>
                      <option value="Enterprise API & Integration">Enterprise API & Integration</option>
                      <option value="Billing & Escrow Payouts">Billing & Escrow Payouts</option>
                      <option value="Security Report">Security Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Brief summary..."
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Message Details *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Describe how we can assist you..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-semibold text-brand-primary outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-primary text-white hover:bg-brand-dark py-3.5 rounded-full text-xs font-bold shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Dispatching Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Inquiry</span>
                      <i className="bi bi-arrow-right text-brand-secondary"></i>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Social Channels & Specs (5 cols) */}
          <div className="lg:col-span-5 space-y-6" data-animation-on-scroll="">
            {/* Social Channels Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-border/60">
                <div className="w-9 h-9 rounded-xl bg-brand-primary text-brand-secondary flex items-center justify-center font-bold text-base">
                  <i className="bi bi-chat-heart"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-primary">Direct Channels</h3>
                  <p className="text-[11px] text-text-secondary">Official creator and platform handles</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-background hover:bg-brand-secondary/20 border border-neutral-border/60 hover:border-brand-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white text-brand-primary flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform text-sm">
                        {social.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">{social.label}</p>
                        <p className="text-xs font-semibold text-text-secondary group-hover:text-brand-primary transition-colors truncate max-w-[170px] sm:max-w-[200px]">{social.value}</p>
                      </div>
                    </div>
                    <i className="bi bi-arrow-up-right text-xs text-text-secondary group-hover:text-brand-primary transition-colors"></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Project Stack Specifications Card */}
            <div className="bg-brand-dark text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-card space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-brand-secondary text-brand-primary flex items-center justify-center font-bold text-base">
                  <i className="bi bi-cpu"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">System Architecture</h3>
                  <p className="text-[11px] text-white/70">Full-stack technical specifications</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {projectDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <i className={`bi ${detail.icon} text-brand-secondary text-sm`}></i>
                      <span className="text-white/70 text-[11px]">{detail.label}:</span>
                    </div>
                    <span className="font-semibold text-white text-[11px] truncate max-w-[150px]">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;