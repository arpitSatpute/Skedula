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
      }
    ]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
