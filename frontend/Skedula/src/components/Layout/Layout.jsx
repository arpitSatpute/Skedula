import React, { useEffect } from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Layout() {
  // Intersection Observer for scroll animations across all pages
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll-visible');
            entry.target.classList.remove('animate-on-scroll-hidden');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('[data-animation-on-scroll], .animate-on-scroll-hidden');
    elements.forEach((el) => {
      if (!el.classList.contains('animate-on-scroll-visible')) {
        el.classList.add('animate-on-scroll-hidden');
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-background text-brand-primary font-secondary selection:bg-brand-secondary selection:text-brand-primary">
      {/* Top Notification Announcement Bar */}
      <div className="bg-brand-secondary text-brand-primary text-center py-2 text-xs font-bold tracking-wider uppercase px-4 flex justify-between items-center md:justify-center relative z-50">
        <span className="flex-1 text-center flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse inline-block"></span>
          Intelligent Scheduling & Business Discovery Platform • 100% Verified Services
        </span>
      </div>

      {/* Navigation Header */}
      <Header />

      {/* Main Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!rounded-2xl !shadow-card !border !border-neutral-border !font-secondary !text-brand-primary !bg-white/95 !backdrop-blur-md"
      />
    </div>
  );
}

export default Layout;