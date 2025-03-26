import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  ShoppingBag,
  Heart,
  Package,
  Settings,
  LogOut,
  Star,
} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface OrderSummary {
  total: number;
  pending: number;
  delivered: number;
}

interface Stats {
  orders: OrderSummary;
  wishlistCount: number;
  cartCount: number;
  pendingRatings: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats>({
    orders: { total: 0, pending: 0, delivered: 0 },
    wishlistCount: 0,
    cartCount: 0,
    pendingRatings: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );
        setUser(res.data);
        console.log(user);
        // Fetch additional stats
        await fetchStats(res.data._id);
      } catch (err) {
        console.error("Error fetching user data:", err);
        navigate("/login"); // Redirect to login if unauthorized
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async (userId: string) => {
      try {
        // Fetch cart count
        const cartRes = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/cart/${userId}`
        );

        // Fetch wishlist count
        const wishlistRes = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/wishlist/${userId}`
        );

        // Fetch orders summary
        const ordersRes = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/orders/user`,
          {
            withCredentials: true,
          }
        );

        const orders = ordersRes.data || [];
        const pendingOrders = orders.filter(
          (o: any) => o.status !== "delivered" && o.status !== "cancelled"
        ).length;
        const deliveredOrders = orders.filter(
          (o: any) => o.status === "delivered"
        ).length;

        // Count orders that need ratings (delivered but not yet rated)
        // This is a placeholder - you'll need to implement the actual rating check
        const pendingRatings = orders.filter(
          (o: any) => o.status === "delivered"
        ).length;

        setStats({
          orders: {
            total: orders.length,
            pending: pendingOrders,
            delivered: deliveredOrders,
          },
          wishlistCount: wishlistRes.data.products?.length || 0,
          cartCount: cartRes.data.products?.length || 0,
          pendingRatings,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header with user info */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 sm:px-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <div className="bg-white text-blue-600 rounded-full h-20 w-20 flex items-center justify-center text-2xl font-bold shadow-lg mb-4 sm:mb-0 sm:mr-6">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <div className="flex items-center mt-1 justify-center sm:justify-start">
                  <Mail className="h-4 w-4 mr-1" />
                  <p>{user?.email}</p>
                </div>
                <div className="mt-2 inline-block bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm">
                  {user?.role === "admin" ? "Administrator" : "Customer"}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {stats.orders.total}
                    </h3>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-yellow-600">
                    {stats.orders.pending} pending
                  </span>
                  <span className="text-green-600">
                    {stats.orders.delivered} delivered
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Wishlist</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {stats.wishlistCount}
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate("/wishlist")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View wishlist →
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Cart Items</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {stats.cartCount}
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate("/cart")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View cart →
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                    <Star className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Pending Reviews</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {stats.pendingRatings}
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate("/orders")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Rate products →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate("/products")}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <ShoppingBag className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">Shop Now</span>
                </button>

                <button
                  onClick={() => navigate("/orders")}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Package className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">My Orders</span>
                </button>

                <button
                  onClick={() => navigate("/wishlist")}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Heart className="h-8 w-8 text-red-500 mb-2" />
                  <span className="text-sm font-medium">Wishlist</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>

            {/* Account settings section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Account Settings
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y">
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500 mr-3" />
                    <span>Personal Information</span>
                  </div>
                  <button
                    onClick={() => navigate("/profile-settings")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-gray-500 mr-3" />
                    <span>Password & Security</span>
                  </div>
                  <button
                    onClick={() => navigate("/profile-settings")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
