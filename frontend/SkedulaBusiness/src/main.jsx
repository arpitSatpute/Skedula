import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout/Layout.jsx'
import Home from './components/Home.jsx'
import Business from './components/Business/Business.jsx'
import Login from './components/Auth/Login.jsx'
import SignUp from './components/Auth/SignUp.jsx'
import ListServices from './components/Services/ListServices.jsx'
import Services from './components/Services/Services.jsx'
import AddService from './components/Services/AddService.jsx'
import AddBusiness from './components/Business/AddBusiness.jsx'
import Appointments from './components/Appointments/Appointments.jsx'
import Wallet from './components/Wallet/Wallet.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import { AuthProvider } from './components/Auth/AuthContext.jsx'
import Protected from '../../Skedula/src/components/Auth/Protected.jsx'

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
        path: "/about",
        element: <About />
      },
      {
        path: "/contact",
        element: <Contact />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path : "/signup",
        element: <SignUp />
      },
      {
        element: <Protected authenticated={true} />,
        children: [
          {
        path: "/businesses",
        element: <Business />
      },
      {
        path: "/services",
        element: <ListServices />
      },
      {
        path: "/services/:id",
        element: <Services/>
      },
      {
        path: "/services/add",
        element: <AddService />
      },
      {
        path: "/services/:id/edit",
        element: <AddService />
      },
      {
        path: "/business/:id/edit",
        element: <AddBusiness />
      },
      {
        path: "/business/add",
        element: <AddBusiness />
      },
      {
        path: "/appointments",
        element: <Appointments />
      },
      {
        path: "/wallet",
        element: <Wallet />
      }
      ]
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
