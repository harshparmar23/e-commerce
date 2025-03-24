"use client";

import type React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Order";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminSettings from "./pages/admin/Settings";
import MaintenancePage from "./pages/MaintenancePage";
import { SettingsProvider, useSettings } from "./context/SettingsContext";

// Admin route guard component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/me`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsAdmin(res.data.role === "admin");
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
};

// Protected route component that checks for maintenance mode
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { settings, isAdmin, loading } = useSettings();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // If maintenance mode is on and user is not admin, redirect to maintenance page
//   // Except for login page which should always be accessible
//   if (
//     settings.maintenanceMode &&
//     !isAdmin &&
//     location.pathname !== "/login" &&
//     location.pathname !== "/maintenance"
//   ) {
//     return <Navigate to="/maintenance" replace />;
//   }

//   // If user tries to access maintenance page when maintenance mode is off, redirect to home
//   if (!settings.maintenanceMode && location.pathname === "/maintenance") {
//     return <Navigate to="/" replace />;
//   }

//   return <>{children}</>;
// };

// Main App component with routes
const AppRoutes = () => {
  const { settings, isAdmin } = useSettings();
  const location = useLocation();

  // Check if we should show maintenance page
  const isMaintenancePage = location.pathname === "/maintenance";
  const shouldShowMaintenance =
    settings.maintenanceMode && !isAdmin && !isMaintenancePage;

  return (
    <Routes>
      {/* Login is always accessible */}
      <Route path="/login" element={<Login />} />

      {/* Maintenance page */}
      <Route
        path="/maintenance"
        element={
          settings.maintenanceMode ? (
            <MaintenancePage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          shouldShowMaintenance ? (
            <Navigate to="/maintenance" replace />
          ) : (
            <Products />
          )
        }
      />
      <Route
        path="/products"
        element={
          shouldShowMaintenance ? (
            <Navigate to="/maintenance" replace />
          ) : (
            <Products />
          )
        }
      />
      <Route
        path="/cart"
        element={
          shouldShowMaintenance ? (
            <Navigate to="/maintenance" replace />
          ) : (
            <Cart />
          )
        }
      />
      <Route
        path="/orders"
        element={
          shouldShowMaintenance ? (
            <Navigate to="/maintenance" replace />
          ) : (
            <Orders />
          )
        }
      />
      <Route
        path="/signup"
        element={
          shouldShowMaintenance ? (
            <Navigate to="/maintenance" replace />
          ) : (
            <Signup />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          shouldShowMaintenance ? (
            <Navigate to="/maintenance" replace />
          ) : (
            <Dashboard />
          )
        }
      />
      <Route
        path="/wishlist"
        element={
          shouldShowMaintenance ? (
            <Navigate to="/maintenance" replace />
          ) : (
            <Wishlist />
          )
        }
      />

      {/* Admin Routes - Always accessible to admins */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

// Wrapper component that uses the settings context
const AppContent = () => {
  return <AppRoutes />;
};

export default function App() {
  return (
    <Router>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </Router>
  );
}
