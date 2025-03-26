import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import {
  Heart,
  ShoppingCart,
  Trash2,
  AlertCircle,
  Check,
  Star,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  avgRating: number;
}

interface WishlistItem {
  productId: Product;
  addedAt: string;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const navigate = useNavigate();
  const { settings } = useSettings();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/me`,
          { withCredentials: true }
        );
        setUserId(res.data._id);
      } catch (err) {
        console.error("Error fetching user data:", err);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/wishlist/${userId}`
      );
      setWishlistItems(data.products || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError("Failed to load your wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASIC_API_URL}/wishlist/${userId}/${productId}`
      );
      setWishlistItems((prevItems) =>
        prevItems.filter((item) => item.productId._id !== productId)
      );
      showNotification("Removed from wishlist", "success");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      showNotification("Failed to remove from wishlist", "error");
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_BASIC_API_URL}/cart/add`, {
        userId,
        productId,
        quantity: 1,
      });

      // Remove from wishlist after adding to cart
      await removeFromWishlist(productId);

      showNotification("Added to cart and removed from wishlist", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("Failed to add to cart", "error");
    }
  };

  const clearWishlist = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASIC_API_URL}/wishlist/${userId}`
      );
      setWishlistItems([]);
      showNotification("Wishlist cleared", "success");
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      showNotification("Failed to clear wishlist", "error");
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
          <Heart className="mr-2 text-red-500" /> Your Wishlist
        </h1>
        <p className="text-gray-600 mb-8">
          Save items you love and add them to your cart anytime
        </p>

        {notification && (
          <div
            className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="flex justify-center mb-4">
              <Heart className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Save items you love by clicking the heart icon on products
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                {wishlistItems.length} item
                {wishlistItems.length !== 1 ? "s" : ""} in your wishlist
              </p>
              <button
                onClick={clearWishlist}
                className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
              >
                <Trash2 size={16} className="mr-1" />
                Clear Wishlist
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.productId._id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={item.productId.imageUrl || "/placeholder.svg"}
                      alt={item.productId.name}
                      className="w-full h-56 object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 bg-red-100 p-1.5 rounded-full shadow-md hover:bg-red-200 transition text-red-500"
                      onClick={() => removeFromWishlist(item.productId._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex-grow flex flex-col">
                    <div className="flex items-center mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(item.productId.avgRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-1">
                        ({item.productId.avgRating})
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                      {item.productId.name}
                    </h2>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                      {item.productId.description}
                    </p>

                    <div className="mt-auto">
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        {settings.currencySymbol}
                        {item.productId.price.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs font-medium mb-2 ${
                          item.productId.stock === 0
                            ? "text-red-600"
                            : item.productId.stock < 5
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {item.productId.stock === 0
                          ? "Out of Stock"
                          : item.productId.stock < 5
                          ? `Only ${item.productId.stock} left`
                          : "In Stock"}
                      </p>

                      <button
                        onClick={() => addToCart(item.productId._id)}
                        disabled={item.productId.stock === 0}
                        className={`w-full py-2 rounded-lg font-medium text-center transition-colors flex items-center justify-center ${
                          item.productId.stock === 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
