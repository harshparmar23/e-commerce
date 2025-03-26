import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import "./index.css";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Orders from "./pages/Order";
import Navigation from "./components/Navigation";
import { ToastContainer } from "react-toastify";
import Wishlist from "./pages/Wishlist";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminCategories from "./pages/admin/Categories";
import AdminRoute from "./components/admin/AdminRoute";
import MaintenancePage from "./pages/Maintenance";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import ProfileSettings from "./pages/ProfileSettings";
import AdminCoupons from "./pages/admin/Coupons";

// MaintenanceWrapper component to handle maintenance mode redirects
const MaintenanceWrapper = ({ children }: { children: React.ReactNode }) => {
  const { settings, isAdmin, loading } = useSettings();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (
    settings.maintenanceMode &&
    !isAdmin &&
    location.pathname !== "/login" &&
    location.pathname !== "/maintenance"
  ) {
    return <Navigate to="/maintenance" replace />;
  }

  // If maintenance mode is off and user is trying to access maintenance page, redirect to home
  if (!settings.maintenanceMode && location.pathname === "/maintenance") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// AppRoutes component with all routes
const AppRoutes = () => {
  return (
    <MaintenanceWrapper>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />

        {/* Admin Routes */}
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
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <AdminRoute>
              <AdminCoupons />
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
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
      </Routes>
    </MaintenanceWrapper>
  );
};

// App component
const App = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </SettingsProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
