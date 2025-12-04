import React, { useEffect, useState } from "react";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navigation/Navbar";
import B2BLandingPage from "./Pages/B2BLandingPage";
import LandingPage from "./Pages/LandingPage";
import CabBooking from "./Pages/CabBooking";
import CabBookingDetails from "./Pages/CabBookingDetails";
import AdminDashboard from "./Pages/AdminDashboard";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AdminRoute from "./Components/Navigation/AdminRoute";

// Lightweight page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className="min-h-[calc(100vh-200px)]"
  >
    {children}
  </motion.div>
);

// Routes with AnimatePresence for smooth page transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <LandingPage />
            </PageWrapper>
          }
        />
        <Route
          path="/b2b"
          element={
            <PageWrapper>
              <B2BLandingPage />
            </PageWrapper>
          }
        />
        <Route
          path="/cab-booking"
          element={
            <PageWrapper>
              <CabBooking />
            </PageWrapper>
          }
        />
        <Route
          path="/cab-booking-details"
          element={
            <PageWrapper>
              <CabBookingDetails />
            </PageWrapper>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

// Layout wrapper so we can hide Navbar/Footer on admin routes
const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Optional: if the current user is an admin, keep them inside the admin area
  // by redirecting any non-admin route back to /admin.
  // This uses a lightweight check against the /admin/me endpoint.
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { fetchAdminMe } = await import("./services/adminService");
        const me = await fetchAdminMe();
        if (!cancelled) {
          setIsAdmin(!!me.success);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingAdmin(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // While we are figuring out if the user is admin, just render routes normally.
  if (checkingAdmin) {
    return (
      <>
        {!isAdminRoute && <Navbar />}
        <AnimatedRoutes />
        {!isAdminRoute && <Footer />}
      </>
    );
  }

  // If user is an admin and tries to access any non-admin page,
  // immediately push them back to the admin dashboard.
  if (isAdmin && !isAdminRoute) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <AnimatedRoutes />
      {!isAdminRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <div className="overflow-x-hidden">
      <Router>
        <AppLayout />
      </Router>
    </div>
  );
}

export default App;