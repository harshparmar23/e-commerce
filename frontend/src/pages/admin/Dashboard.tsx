import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
  recentOrders: any[];
  lowStockProducts: any[];
  orderStatusDistribution: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/admin/dashboard`,
          {
            withCredentials: true,
          }
        );
        setDashboardData(data);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        if (error.response?.status === 403) {
          navigate("/login");
        } else {
          setError("Failed to load dashboard data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 md:ml-20 lg:ml-64">
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 md:ml-20 lg:ml-64">
          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    lowStockProducts,
    orderStatusDistribution,
  } = dashboardData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 md:ml-20 lg:ml-64">
        {/* Admin Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">{totalUsers}</h3>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold">{totalProducts}</h3>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold">{totalOrders}</h3>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Order Status</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-1/4 text-sm flex items-center">
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    Pending
                  </div>
                  <div className="w-3/4 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (orderStatusDistribution.pending /
                              (orderStatusDistribution.pending +
                                orderStatusDistribution.processing +
                                orderStatusDistribution.shipped +
                                orderStatusDistribution.delivered +
                                orderStatusDistribution.cancelled)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {orderStatusDistribution.pending}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 text-sm flex items-center">
                    <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                    Processing
                  </div>
                  <div className="w-3/4 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (orderStatusDistribution.processing /
                              (orderStatusDistribution.pending +
                                orderStatusDistribution.processing +
                                orderStatusDistribution.shipped +
                                orderStatusDistribution.delivered +
                                orderStatusDistribution.cancelled)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {orderStatusDistribution.processing}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 text-sm flex items-center">
                    <Truck className="h-4 w-4 text-purple-500 mr-2" />
                    Shipped
                  </div>
                  <div className="w-3/4 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (orderStatusDistribution.shipped /
                              (orderStatusDistribution.pending +
                                orderStatusDistribution.processing +
                                orderStatusDistribution.shipped +
                                orderStatusDistribution.delivered +
                                orderStatusDistribution.cancelled)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {orderStatusDistribution.shipped}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Delivered
                  </div>
                  <div className="w-3/4 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (orderStatusDistribution.delivered /
                              (orderStatusDistribution.pending +
                                orderStatusDistribution.processing +
                                orderStatusDistribution.shipped +
                                orderStatusDistribution.delivered +
                                orderStatusDistribution.cancelled)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {orderStatusDistribution.delivered}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 text-sm flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    Cancelled
                  </div>
                  <div className="w-3/4 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (orderStatusDistribution.cancelled /
                              (orderStatusDistribution.pending +
                                orderStatusDistribution.processing +
                                orderStatusDistribution.shipped +
                                orderStatusDistribution.delivered +
                                orderStatusDistribution.cancelled)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {orderStatusDistribution.cancelled}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Low Stock Products</h2>
              {lowStockProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lowStockProducts.map((product) => (
                        <tr key={product._id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={product.imageUrl || "/placeholder.svg"}
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                product.stock === 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {product.stock} left
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(product.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No low stock products found
                </p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.substring(order._id.length - 6)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {order.userId?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(order.status)}
                            <span
                              className={`ml-1.5 text-xs font-medium ${
                                order.status === "delivered"
                                  ? "text-green-700"
                                  : order.status === "cancelled"
                                  ? "text-red-700"
                                  : order.status === "shipped"
                                  ? "text-purple-700"
                                  : order.status === "processing"
                                  ? "text-blue-700"
                                  : "text-yellow-700"
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent orders found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
