"use client";

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Tag,
  Layers,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const AdminSidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Set initial expanded state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-open catalog section if on a catalog page
  useEffect(() => {
    if (
      location.pathname.includes("/admin/products") ||
      location.pathname.includes("/admin/categories")
    ) {
      setCatalogOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASIC_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      Cookies.remove("token");
      Cookies.remove("userId");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCatalog = () => {
    setCatalogOpen(!catalogOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md"
        onClick={toggleMobileMenu}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out ${
          expanded ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 flex flex-col`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link
            to="/admin"
            className={`flex items-center ${
              expanded ? "" : "justify-center"
            } space-x-2`}
          >
            <Package className="h-8 w-8 text-blue-600" />
            {expanded && (
              <span className="text-xl font-bold text-gray-800">Admin</span>
            )}
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden md:block text-gray-500 hover:text-gray-700"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronRight
              className={`h-5 w-5 transform transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            <li>
              <Link
                to="/admin"
                className={`flex items-center ${
                  expanded ? "px-4" : "justify-center px-2"
                } py-2 rounded-md ${
                  isActive("/admin") && !location.pathname.includes("/admin/")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <LayoutDashboard className="h-5 w-5 min-w-[20px]" />
                {expanded && <span className="ml-2">Dashboard</span>}
              </Link>
            </li>

            <li>
              <Link
                to="/admin/orders"
                className={`flex items-center ${
                  expanded ? "px-4" : "justify-center px-2"
                } py-2 rounded-md ${
                  isActive("/admin/orders")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ShoppingCart className="h-5 w-5 min-w-[20px]" />
                {expanded && <span className="ml-2">Orders</span>}
              </Link>
            </li>

            <li>
              <button
                onClick={toggleCatalog}
                className={`flex items-center w-full ${
                  expanded ? "px-4 justify-between" : "justify-center px-2"
                } py-2 rounded-md ${
                  location.pathname.includes("/admin/products") ||
                  location.pathname.includes("/admin/categories")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-expanded={catalogOpen}
              >
                <div className="flex items-center">
                  <Tag className="h-5 w-5 min-w-[20px]" />
                  {expanded && <span className="ml-2">Catalog</span>}
                </div>
                {expanded && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      catalogOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
              {(expanded && catalogOpen) ||
              (!expanded &&
                (isActive("/admin/products") ||
                  isActive("/admin/categories"))) ? (
                <ul className={`mt-1 ${expanded ? "ml-6" : "ml-0"} space-y-1`}>
                  <li>
                    <Link
                      to="/admin/products"
                      className={`flex items-center ${
                        expanded ? "px-4" : "justify-center px-2"
                      } py-2 rounded-md ${
                        isActive("/admin/products")
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Package className="h-4 w-4 min-w-[16px]" />
                      {expanded && <span className="ml-2">Products</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/categories"
                      className={`flex items-center ${
                        expanded ? "px-4" : "justify-center px-2"
                      } py-2 rounded-md ${
                        isActive("/admin/categories")
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Layers className="h-4 w-4 min-w-[16px]" />
                      {expanded && <span className="ml-2">Categories</span>}
                    </Link>
                  </li>
                </ul>
              ) : null}
            </li>

            <li>
              <Link
                to="/admin/users"
                className={`flex items-center ${
                  expanded ? "px-4" : "justify-center px-2"
                } py-2 rounded-md ${
                  isActive("/admin/users")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Users className="h-5 w-5 min-w-[20px]" />
                {expanded && <span className="ml-2">Users</span>}
              </Link>
            </li>

            <li>
              <Link
                to="/admin/settings"
                className={`flex items-center ${
                  expanded ? "px-4" : "justify-center px-2"
                } py-2 rounded-md ${
                  isActive("/admin/settings")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Settings className="h-5 w-5 min-w-[20px]" />
                {expanded && <span className="ml-2">Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              expanded ? "w-full px-4" : "justify-center px-2"
            } py-2 rounded-md text-red-600 hover:bg-red-50`}
          >
            <LogOut className="h-5 w-5 min-w-[20px]" />
            {expanded && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
