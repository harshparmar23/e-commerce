"use client";

import type React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Save,
  RefreshCw,
  Shield,
  Database,
  Globe,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminSettings = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const navigate = useNavigate();

  // Settings state
  const [settings, setSettings] = useState({
    siteName: "ShopApp",
    siteDescription: "Your one-stop e-commerce solution",
    contactEmail: "support@shopapp.com",
    enableRegistration: true,
    enableGuestCheckout: false,
    maintenanceMode: false,
    defaultCurrency: "INR",
    taxRate: 18,
    shippingFee: 0,
    freeShippingThreshold: 1000,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/me`,
          { withCredentials: true }
        );
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setSettings({
        ...settings,
        [name]: target.checked,
      });
    } else if (type === "number") {
      setSettings({
        ...settings,
        [name]: Number.parseFloat(value),
      });
    } else {
      setSettings({
        ...settings,
        [name]: value,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      [name]: checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Settings updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error updating settings:", error);
      setError("Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 md:ml-20 lg:ml-64">
        {/* Admin Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Settings</h1>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {user?.name || "Admin User"}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
              <div className="flex items-center">
                <Save className="h-6 w-6 text-green-500 mr-3" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-blue-600" />
                  General Settings
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <textarea
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Currency
                  </label>
                  <select
                    name="defaultCurrency"
                    value={settings.defaultCurrency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center h-full">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900">
                        Enable Maintenance Mode
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-600" />
                  Security Settings
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableRegistration"
                      checked={settings.enableRegistration}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      Allow New User Registrations
                    </span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableGuestCheckout"
                      checked={settings.enableGuestCheckout}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      Allow Guest Checkout
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center">
                  <Database className="mr-2 h-5 w-5 text-blue-600" />
                  E-commerce Settings
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={settings.taxRate}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    name="shippingFee"
                    value={settings.shippingFee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    name="freeShippingThreshold"
                    value={settings.freeShippingThreshold}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-3"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 inline-block mr-1" />
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
