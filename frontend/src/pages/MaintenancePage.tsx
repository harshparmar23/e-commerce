import type React from "react";
import { useSettings } from "../context/SettingsContext";
import { Navigate } from "react-router-dom";
import { AlertTriangle, Mail, ArrowLeft } from "lucide-react";

const MaintenancePage: React.FC = () => {
  const { settings, isAdmin } = useSettings();

  // If maintenance mode is off, redirect to home
  if (!settings.maintenanceMode) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-4 rounded-full">
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Site Maintenance
        </h1>

        <div className="h-1 w-20 bg-yellow-500 mx-auto mb-6"></div>

        <p className="text-gray-600 mb-8 text-lg">
          {settings.maintenanceMessage ||
            "We're currently performing maintenance. Please check back soon!"}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href={`mailto:${settings.contactEmail}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Mail className="mr-2 h-5 w-5" />
            Contact Support
          </a>

          <a
            href="/"
            className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Try Again Later
          </a>
        </div>

        <p className="text-sm text-gray-500">
          We apologize for the inconvenience and appreciate your patience.
        </p>

        {isAdmin && (
          <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-blue-700 font-medium mb-3">
              You're seeing this page as an admin. Regular users cannot access
              the site during maintenance mode.
            </p>
            <a
              href="/admin/settings"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go to Admin Settings
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
