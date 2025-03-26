import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";

// Define the settings interface
interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  enableRegistration: boolean;
  enableGuestCheckout: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultCurrency: string;
  currencySymbol: string;
  shippingFee: number;
  freeShippingThreshold: number;
}

// Define the context interface
interface SettingsContextType {
  settings: Settings;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const defaultSettings: Settings = {
  siteName: "ShopApp",
  siteDescription: "Your one-stop e-commerce solution",
  contactEmail: "support@shopapp.com",
  enableRegistration: true,
  enableGuestCheckout: false,
  maintenanceMode: false,
  maintenanceMessage:
    "We're currently performing maintenance. Please check back soon!",
  defaultCurrency: "INR",
  currencySymbol: "₹",
  shippingFee: 0,
  freeShippingThreshold: 1000,
};

// Create the context with default values
const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isAdmin: false,
  loading: true,
  error: null,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

// Custom hook to use the settings context
export const useSettings = () => useContext(SettingsContext);

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );
        setIsAdmin(res.data.role === "admin");
      } catch (err) {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/settings`
      );

      // Ensure enableRegistration is properly set from the API response
      setSettings({
        ...defaultSettings,
        ...data,
        enableRegistration:
          data.enableRegistration !== undefined
            ? data.enableRegistration
            : true,
      });
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Function to update settings
  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASIC_API_URL}/settings`,
        newSettings,
        {
          withCredentials: true,
        }
      );
      setSettings(res.data);
      return res.data;
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isAdmin,
        loading,
        error,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
