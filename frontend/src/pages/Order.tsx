"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  AlertCircle,
  Search,
  Filter,
  Gift,
  Star,
} from "lucide-react";
import RatingModal from "../components/RatingModal";

interface OrderProduct {
  productId: {
    _id: string;
    name: string;
    imageUrl: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  userId: string;
  products: OrderProduct[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  totalAmount: number;
  isGift: boolean;
  giftMessage: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface RatingInfo {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [user, setUser] = useState<{ _id: string; name: string } | null>(null);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [ratingInfo, setRatingInfo] = useState<RatingInfo | null>(null);
  const [ratedProducts, setRatedProducts] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // First fetch the current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        navigate("/login"); // Redirect to login if unauthorized
      }
    };

    fetchUser();
  }, [navigate]);

  // Then fetch the orders once we have the user
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/orders/user`,
          { withCredentials: true }
        );

        setOrders(response.data);

        // Fetch user's ratings to know which products have been rated
        await fetchUserRatings();

        // If we just placed an order, show a success message
        const justOrdered = new URLSearchParams(window.location.search).get(
          "ordered"
        );
        if (justOrdered === "true") {
          // You could show a success message here if needed
        }
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load your orders. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const fetchUserRatings = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/ratings/user`,
        { withCredentials: true }
      );

      // Create a set of productIds that have been rated
      const ratedProductIds: Set<string> = new Set(
        response.data.map((rating: any) => rating.productId._id)
      );

      setRatedProducts(ratedProductIds);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASIC_API_URL}/orders/${orderId}/cancel`,
        {},
        { withCredentials: true }
      );

      // Update the order status in the local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );

      // Update selected order if it's the one being cancelled
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "cancelled" });
      }
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      setError(
        error.response?.data?.error ||
          "Failed to cancel order. Please try again."
      );
    }
  };

  const handleRateProduct = async (
    productId: string,
    orderId: string,
    productName: string,
    productImage: string
  ) => {
    // Check if product has already been rated
    if (ratedProducts.has(productId)) {
      alert("You have already rated this product");
      return;
    }

    setRatingInfo({
      productId,
      productName,
      productImage,
      orderId,
    });
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async () => {
    // Refresh the list of rated products
    await fetchUserRatings();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500" />;
      case "processing":
        return <Package className="text-blue-500" />;
      case "shipped":
        return <Truck className="text-purple-500" />;
      case "delivered":
        return <CheckCircle className="text-green-500" />;
      case "cancelled":
        return <XCircle className="text-red-500" />;
      default:
        return <Clock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredOrders = orders
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .filter((order) => {
      if (!searchQuery) return true;

      // Search by order ID
      if (order._id.toLowerCase().includes(searchQuery.toLowerCase()))
        return true;

      // Search by product name
      return order.products.some((product) =>
        product.productId.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center">
          <Package className="mr-2" /> Your Orders
        </h1>
        <p className="text-gray-600 mb-8">Track and manage your orders</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by order ID or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <Filter className="text-gray-500 mr-2" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {orders.length === 0 && !loading && !error ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="flex justify-center mb-4">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {user
                ? "You haven't placed any orders yet."
                : "Please log in to view your orders."}
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">No matching orders</h2>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOrderClick(order)}
              >
                <div className="p-6 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500">Order ID:</span>
                        <span className="font-medium">{order._id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Placed on:
                        </span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span
                          className={`font-medium ${
                            order.status === "delivered"
                              ? "text-green-600"
                              : order.status === "cancelled"
                              ? "text-red-600"
                              : order.status === "shipped"
                              ? "text-purple-600"
                              : order.status === "processing"
                              ? "text-blue-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-grow">
                      <h3 className="font-medium mb-3">Items</h3>
                      <div className="flex flex-wrap gap-4">
                        {order.products.slice(0, 3).map((product) => (
                          <div
                            key={product.productId._id}
                            className="flex items-center gap-3"
                          >
                            <img
                              src={
                                product.productId.imageUrl || "/placeholder.svg"
                              }
                              alt={product.productId.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                            <div>
                              <p className="text-sm font-medium line-clamp-1">
                                {product.productId.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {product.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.products.length > 3 && (
                          <div className="flex items-center">
                            <span className="text-sm text-blue-600">
                              +{order.products.length - 3} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:text-right">
                      <h3 className="font-medium mb-2">Total</h3>
                      <p className="text-lg font-bold">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">
                    Order Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-gray-600">Order ID:</div>
                      <div className="font-medium">{selectedOrder._id}</div>

                      <div className="text-gray-600">Date Placed:</div>
                      <div>{formatDate(selectedOrder.createdAt)}</div>

                      <div className="text-gray-600">Status:</div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedOrder.status)}
                        <span
                          className={`font-medium ${
                            selectedOrder.status === "delivered"
                              ? "text-green-600"
                              : selectedOrder.status === "cancelled"
                              ? "text-red-600"
                              : selectedOrder.status === "shipped"
                              ? "text-purple-600"
                              : selectedOrder.status === "processing"
                              ? "text-blue-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {getStatusText(selectedOrder.status)}
                        </span>
                      </div>

                      <div className="text-gray-600">Payment Method:</div>
                      <div className="capitalize">
                        {selectedOrder.paymentMethod.replace("_", " ")}
                      </div>

                      <div className="text-gray-600">Payment Status:</div>
                      <div className="capitalize">
                        {selectedOrder.paymentStatus}
                      </div>

                      {selectedOrder.trackingNumber && (
                        <>
                          <div className="text-gray-600">Tracking Number:</div>
                          <div>{selectedOrder.trackingNumber}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-gray-700">
                    Shipping Address
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-1">
                      {selectedOrder.shippingAddress.street}
                    </p>
                    <p className="mb-1">
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state}
                    </p>
                    <p className="mb-1">
                      {selectedOrder.shippingAddress.country},{" "}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                  </div>

                  {selectedOrder.isGift && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 text-gray-700 flex items-center">
                        <Gift className="mr-2" size={16} />
                        Gift Message
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg italic">
                        "{selectedOrder.giftMessage}"
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <h4 className="font-medium mb-3 text-gray-700">Order Items</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden mb-6">
                <div className="divide-y">
                  {selectedOrder.products.map((product) => (
                    <div
                      key={product.productId._id}
                      className="p-4 flex items-center"
                    >
                      <img
                        src={product.productId.imageUrl || "/placeholder.svg"}
                        alt={product.productId.name}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <div className="flex-grow">
                        <h5 className="font-medium">
                          {product.productId.name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          Quantity: {product.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₹{product.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: ₹
                          {(product.price * product.quantity).toFixed(2)}
                        </p>

                        {/* Rating button for delivered orders */}
                        {selectedOrder.status === "delivered" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRateProduct(
                                product.productId._id,
                                selectedOrder._id,
                                product.productId.name,
                                product.productId.imageUrl
                              );
                            }}
                            className={`mt-2 flex items-center text-sm px-3 py-1 rounded-full ${
                              ratedProducts.has(product.productId._id)
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            }`}
                            disabled={ratedProducts.has(product.productId._id)}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {ratedProducts.has(product.productId._id)
                              ? "Rated"
                              : "Rate Product"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                {(selectedOrder.status === "pending" ||
                  selectedOrder.status === "processing") && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}

                <div className="ml-auto text-right">
                  <div className="text-gray-600 mb-1">Order Total:</div>
                  <div className="text-2xl font-bold">
                    ₹{selectedOrder.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && ratingInfo && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          productId={ratingInfo.productId}
          productName={ratingInfo.productName}
          productImage={ratingInfo.productImage}
          orderId={ratingInfo.orderId}
          onRatingSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default Orders;
