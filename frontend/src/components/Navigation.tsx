"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ShoppingBag,
  Package,
  User,
  LogOut,
  Menu,
  X,
  Heart,
  Home,
  ShoppingCart,
} from "lucide-react";
import Cookies from "js-cookie";
import { useSettings } from "../context/SettingsContext";

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, isAdmin } = useSettings();
  const [renderNavbar, setRenderNavbar] = useState(true);

  useEffect(() => {
    // Don't render the navbar on maintenance page for non-admin users
    if (location.pathname === "/maintenance" && !isAdmin) {
      setRenderNavbar(false);
    } else {
      setRenderNavbar(true);
    }
  }, [location.pathname, isAdmin]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Authentication check effect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get("token");
        console.log("Navigation auth check, token present:", !!token);

        if (!token) {
          console.log("No token found, setting logged out state");
          setIsLoggedIn(false);
          setUserName("");
          setCartCount(0);
          setWishlistCount(0);
          setIsLoading(false);
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

        // Check for token refresh in response headers
        const newToken = res.headers["new-auth-token"];
        if (newToken) {
          console.log("Refreshing token");
          Cookies.set("token", newToken, {
            expires: 7,
            secure: window.location.protocol === "https:",
            sameSite: window.location.protocol === "https:" ? "None" : "Lax",
            path: "/",
          });
        }

        console.log("Auth successful, user:", res.data.name);
        setIsLoggedIn(true);
        setUserName(res.data.name);

        // Fetch counts after successful auth
        await Promise.all([
          fetchCartCount(res.data._id),
          fetchWishlistCount(res.data._id),
        ]);
      } catch (err) {
        console.error("Auth check failed:", err);
        // Clear all authentication state
        setIsLoggedIn(false);
        setUserName("");
        setCartCount(0);
        setWishlistCount(0);
        // Clear invalid tokens
        Cookies.remove("token");
        Cookies.remove("userId");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-check when route changes

  const fetchCartCount = async (userId: string) => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/cart/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCartCount(data.products?.length || 0);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

  const fetchWishlistCount = async (userId: string) => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/wishlist/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWishlistCount(data.products?.length || 0);
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
      setWishlistCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");

      // Immediately update UI state
      setIsLoggedIn(false);
      setUserName("");
      setCartCount(0);
      setWishlistCount(0);
      setIsProfileOpen(false);
      setIsMenuOpen(false);

      // Remove cookies immediately
      Cookies.remove("token", { path: "/" });
      Cookies.remove("userId", { path: "/" });

      // Also try removing without path
      Cookies.remove("token");
      Cookies.remove("userId");

      try {
        // Call backend logout
        const response = await axios.post(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/logout`,
          {},
          {
            withCredentials: true,
          }
        );
        console.log("Backend logout response:", response.data);
      } catch (backendError) {
        console.error("Backend logout failed, but continuing:", backendError);
      }

      console.log("Logout complete, redirecting to login");
      navigate("/login", { replace: true });

      // Force a page reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error("Logout process failed:", err);
      // Force cleanup even if everything fails
      setIsLoggedIn(false);
      setUserName("");
      setCartCount(0);
      setWishlistCount(0);
      Cookies.remove("token");
      Cookies.remove("userId");
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!renderNavbar) {
    return null;
  }

  // Show loading state briefly
  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {settings.siteName}
              </span>
            </div>
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {settings.siteName}
              </span>
            </Link>

            <div className="hidden md:flex md:ml-10 md:space-x-8">
              <Link
                to="/products"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === "/products"
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Home className="mr-1 h-4 w-4" />
                Products
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    to="/cart"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      location.pathname === "/cart"
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/wishlist"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      location.pathname === "/wishlist"
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Heart className="mr-1 h-4 w-4" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/orders"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      location.pathname === "/orders"
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Package className="mr-1 h-4 w-4" />
                    Orders
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full py-1 pl-2 pr-3 transition-colors"
                >
                  <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center mr-2">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{userName.split(" ")[0]}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="inline-block mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="inline-block mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="inline-block mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            {isLoggedIn && (
              <>
                <Link
                  to="/cart"
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative mr-1"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/wishlist"
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative mr-1"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/products"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === "/products"
                  ? "border-blue-500 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              }`}
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Products
              </div>
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/cart"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    location.pathname === "/cart"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
                  onClick={toggleMenu}
                >
                  <div className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </Link>
                <Link
                  to="/wishlist"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    location.pathname === "/wishlist"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
                  onClick={toggleMenu}
                >
                  <div className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                </Link>
                <Link
                  to="/orders"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    location.pathname === "/orders"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
                  onClick={toggleMenu}
                >
                  <div className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Orders
                  </div>
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="space-y-1">
                <div className="flex items-center px-4 py-2">
                  <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center mr-3">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-800">
                      {userName}
                    </div>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={toggleMenu}
                >
                  <div className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Profile
                  </div>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={toggleMenu}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Admin Dashboard
                    </div>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <div className="flex items-center">
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                <Link
                  to="/login"
                  className="block py-2 px-4 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 px-4 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
