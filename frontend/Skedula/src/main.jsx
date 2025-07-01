import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Layout from './components/Layout/Layout.jsx'
import Home from './components/Home.jsx'
import ListBusiness from './components/business/ListBusiness.jsx'
import BusinessDetails from './components/business/Business.jsx'
import ListServices from './components/services/ListServices.jsx'
import Services from './components/services/Services.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Wallet from './components/Wallet/Wallet.jsx'
import About from './components/About.jsx'
import Appointments from './components/Appointments/Appointments.jsx'
import Profiles from './components/User/Profile.jsx'
import Contact from './components/Contact.jsx'
import BookAppointment from './components/Appointments/BookAppointment.jsx'
import Login from './components/Auth/Login.jsx'
import SignUp from './components/Auth/SignUp.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/signup",
        element: <SignUp />
      },
      {
        path: "/about",
        element: <About />
      },
      {
        path: "/businesses",
        element: <ListBusiness />
      },
      {
        path: "/businesses/:id",
        element: <BusinessDetails />
      },
      {
        path: "/services",
        element: <ListServices />
      },
      {
        path: "/services/:id",
        element: <Services />
      },
      {
        path: "/wallet",
        element: <Wallet />
      },
      {
        path: "/appointments",
        element: <Appointments />
      },
      {
        path: "/profile",
        element: <Profiles />
      },
      {
        path: "/contact",
        element: <Contact />
      },
      {
        path: "/appointments/book",
        element: <BookAppointment />
      },
      
    ]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
