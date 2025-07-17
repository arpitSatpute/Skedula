import { React, StrictMode } from 'react'
import ReactDOM from 'react-dom';
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
import Protected from './components/Auth/Protected.jsx'
import AuthRoute from './components/Auth/AuthRoute.jsx'
import UserProfile from './components/Profile/UserProfile.jsx'
import EditService from './components/Services/EditService.jsx';

// Create a wrapper component that provides AuthContext inside Router
// const AppWithAuth = () => {
//   return (
//     // <AuthProvider>
//       <Layout />
//     // </AuthProvider>
//   )
// }

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
      // Public routes that redirect authenticated users
      // {
      //   element: <AuthRoute />,
      //   children: [
          {
            path: "/login",
            element: <Login />
          },
          {
            path: "/signup",
            element: <SignUp />
          },
      //   ]
      // },
      // Protected routes that require authentication
      // {
      //   element: <Protected />,
      //   children: [
          {
            path: "/profile",
            element: <UserProfile />
          },
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
            path: "/services/add/:id",
            element: <AddService />
          },
          {
            path: "/services/edit/:id/:serviceId",
            element: <EditService />
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
    ]
//   }
// ]
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
