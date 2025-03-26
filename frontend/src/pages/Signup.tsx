import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useSettings } from "../context/SettingsContext";
import { AlertCircle } from "lucide-react";

export default function SignupPage() {
  const { settings, loading } = useSettings();
  const navigate = useNavigate();
  const [showRegistrationClosed, setShowRegistrationClosed] = useState(false);

  useEffect(() => {
    // If registration is disabled, show message and redirect after delay
    if (!loading && !settings.enableRegistration) {
      setShowRegistrationClosed(true);
      const timer = setTimeout(() => {
        navigate("/login");
      }, 5000); // Redirect after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [settings, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showRegistrationClosed) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Registration Temporarily Closed
          </h1>
          <p className="text-center text-gray-600">
            We're not accepting new registrations at this time. Please check
            back later or contact our support team for assistance.
          </p>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-4">
              You will be redirected to the login page shortly...
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AuthForm type="signup" />;
}
