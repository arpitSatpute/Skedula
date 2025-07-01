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
        path: "/businesses",
        element: <Business />
      },
      {
        path: "/auth/login",
        element: <Login />
      },
      {
        path : "/auth/signup",
        element: <SignUp />
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
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
