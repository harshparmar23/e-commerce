"use client";

import type React from "react";
import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useSettings } from "../../context/SettingsContext";
import { toast } from "react-toastify";

const AdminSettings: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    enableRegistration: false,
    enableGuestCheckout: false,
    maintenanceMode: false,
    maintenanceMessage: "",
    defaultCurrency: "",
    currencySymbol: "",
    shippingFee: 0,
    freeShippingThreshold: 0,
  });
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || "",
        siteDescription: settings.siteDescription || "",
        contactEmail: settings.contactEmail || "",
        enableRegistration: settings.enableRegistration || false,
        enableGuestCheckout: settings.enableGuestCheckout || false,
        maintenanceMode: settings.maintenanceMode || false,
        maintenanceMessage: settings.maintenanceMessage || "",
        defaultCurrency: settings.defaultCurrency || "",
        currencySymbol: settings.currencySymbol || "",
        shippingFee: settings.shippingFee || 0,
        freeShippingThreshold: settings.freeShippingThreshold || 0,
      });
    }
  }, [settings]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number.parseFloat(value)
          : value,
    });
  };

  const handleMaintenanceToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;

    if (newValue === true) {
      // If turning maintenance mode ON, show confirmation dialog
      setShowMaintenanceConfirm(true);
    } else {
      // If turning maintenance mode OFF, update immediately
      handleSaveSettings({ ...formData, maintenanceMode: false });
    }
  };

  const confirmMaintenanceMode = () => {
    handleSaveSettings({ ...formData, maintenanceMode: true });
    setShowMaintenanceConfirm(false);
  };

  const cancelMaintenanceMode = () => {
    setFormData({ ...formData, maintenanceMode: false });
    setShowMaintenanceConfirm(false);
  };

  const handleSaveSettings = async (data: typeof formData) => {
    try {
      await updateSettings(data);
      await refreshSettings();
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveSettings(formData);
  };

  return (
    <AdminLayout title="Admin Settings">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

        {settings.maintenanceMode && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Maintenance Mode Active
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Your site is currently in maintenance mode. Only
                    administrators can access the site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                General Settings
              </h2>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="siteName"
                >
                  Site Name
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="siteDescription"
                >
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="contactEmail"
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                E-commerce Settings
              </h2>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="defaultCurrency"
                >
                  Default Currency
                </label>
                <select
                  id="defaultCurrency"
                  name="defaultCurrency"
                  value={formData.defaultCurrency}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="INR">Indian Rupee (INR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="currencySymbol"
                >
                  Currency Symbol
                </label>
                <input
                  type="text"
                  id="currencySymbol"
                  name="currencySymbol"
                  value={formData.currencySymbol}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  maxLength={3}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="shippingFee"
                >
                  Shipping Fee
                </label>
                <input
                  type="number"
                  id="shippingFee"
                  name="shippingFee"
                  value={formData.shippingFee}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="freeShippingThreshold"
                >
                  Free Shipping Threshold
                </label>
                <input
                  type="number"
                  id="freeShippingThreshold"
                  name="freeShippingThreshold"
                  value={formData.freeShippingThreshold}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Site Access Settings</h2>

            <div className="flex flex-wrap -mx-2">
              <div className="px-2 w-full md:w-1/2 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableRegistration"
                    name="enableRegistration"
                    checked={formData.enableRegistration}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    className="ml-2 block text-gray-700"
                    htmlFor="enableRegistration"
                  >
                    Enable User Registration
                  </label>
                </div>
              </div>

              <div className="px-2 w-full md:w-1/2 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableGuestCheckout"
                    name="enableGuestCheckout"
                    checked={formData.enableGuestCheckout}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    className="ml-2 block text-gray-700"
                    htmlFor="enableGuestCheckout"
                  >
                    Enable Guest Checkout
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Maintenance Mode</h2>

            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={formData.maintenanceMode}
                  onChange={handleMaintenanceToggle}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  className="ml-2 block text-gray-700 font-medium"
                  htmlFor="maintenanceMode"
                >
                  Enable Maintenance Mode
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-6">
                When enabled, only administrators can access the site. All other
                users will see the maintenance page.
              </p>
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="maintenanceMessage"
              >
                Maintenance Message
              </label>
              <textarea
                id="maintenanceMessage"
                name="maintenanceMessage"
                value={formData.maintenanceMessage}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={3}
                placeholder="Enter a message to display during maintenance mode"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Settings
            </button>
          </div>
        </form>

        {/* Maintenance Mode Confirmation Dialog */}
        {showMaintenanceConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">
                Enable Maintenance Mode?
              </h3>
              <p className="mb-6 text-gray-600">
                Enabling maintenance mode will prevent all non-admin users from
                accessing your site. They will be redirected to the maintenance
                page. Are you sure you want to continue?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelMaintenanceMode}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMaintenanceMode}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Enable Maintenance Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
