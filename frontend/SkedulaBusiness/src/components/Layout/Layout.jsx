import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Layout() {
  // Hardcode login state for testing
  const isLoggedIn = true;
  const onLogin = () => console.log('Login clicked');
  const onLogout = () => console.log('Logout clicked');
  return (
    <div>
        <Header isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
        <Outlet />
        <Footer />
        <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        theme="light"
      />
    </div>
  )
}

export default Layout;