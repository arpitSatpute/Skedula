import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'


function Layout() {
  // Hardcode login state for testing
  // const isLoggedIn = true;
  // const onLogin = () => console.log('Login clicked');
  // const onLogout = () => console.log('Logout clicked');
  return (
    <div>
        <Header />
        <Outlet />
        <Footer />
    </div>
  )
}

export default Layout;