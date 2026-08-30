import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layout & Static pages
import Layout from './components/Layout/Layout.jsx';
import Home from './components/Home.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';

// Auth
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Signup.jsx';
import Protected from './components/Auth/Protected.jsx';
import { AuthProvider } from './components/Auth/AuthContext.jsx';

// Business Components
import BusinessRouter from './components/business/BusinessRouter.jsx';
import ListBusiness from './components/business/ListBusiness.jsx';
import Business from './components/business/Business.jsx';
import OwnerBusiness from './components/business/OwnerBusiness.jsx';
import AddBusiness from './components/business/AddBusiness.jsx';

// Services Components
import ServicesRouter from './components/services/ServicesRouter.jsx';
import ListServices from './components/services/ListServices.jsx';
import Services from './components/services/Services.jsx';
import AddService from './components/services/AddService.jsx';
import EditService from './components/services/EditService.jsx';

// Appointments Components
import AppointmentsRouter from './components/Appointments/AppointmentsRouter.jsx';
import BookAppointment from './components/Appointments/BookAppointment.jsx';
import OwnerAppointments from './components/Appointments/OwnerAppointments.jsx';

// Profile Components
import ProfileRouter from './components/Profile/ProfileRouter.jsx';

// Wallet & Payment Components
import Wallet from './components/Wallet/Wallet.jsx';
import Payment from './components/Wallet/Payment.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Public pages
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
        path: "/signup",
        element: <Signup />
      },

      // Public / Dynamic Business & Service listings
      {
        path: "/businesses",
        element: <BusinessRouter />
      },
      {
        path: "/businesses/explore",
        element: <ListBusiness />
      },
      {
        path: "/services",
        element: <ServicesRouter />
      },
      {
        path: "/services/explore",
        element: <ListServices />
      },

      // Protected General Routes (Accessible to authenticated Customers & Owners)
      {
        element: <Protected />,
        children: [
          {
            path: "/profile",
            element: <ProfileRouter />
          },
          {
            path: "/wallet",
            element: <Wallet />
          },
          {
            path: "/payment",
            element: <Payment />
          },
          {
            path: "/businesses/:id",
            element: <Business />
          },
          {
            path: "/services/:id",
            element: <Services />
          },
          {
            path: "/appointments",
            element: <AppointmentsRouter />
          }
        ]
      },

      // Protected Customer-Only Routes
      {
        element: <Protected allowedRoles={['CUSTOMER']} />,
        children: [
          {
            path: "/appointments/book/:serviceId/:businessId",
            element: <BookAppointment />
          }
        ]
      },

      // Protected Business Owner-Only Routes
      {
        element: <Protected allowedRoles={['OWNER']} />,
        children: [
          {
            path: "/business/manage",
            element: <OwnerBusiness />
          },
          {
            path: "/business/add",
            element: <AddBusiness />
          },
          {
            path: "/business/:id/edit",
            element: <AddBusiness />
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
            path: "/appointments/business/:id",
            element: <OwnerAppointments />
          },
          {
            path: "/appointments/business/service/:id/:serviceId",
            element: <OwnerAppointments />
          }
        ]
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
