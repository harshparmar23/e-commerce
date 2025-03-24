"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Star,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isBestseller: boolean;
  avgRating: number;
  imageUrl: string;
  majorCategory: { _id: string; name: string };
  subCategory: { _id: string; name: string };
  createdAt: string;
}

export default function ProductList({
  searchQuery,
  sortOrder,
  showBestsellers,
  showNewArrivals,
  selectedMajorCategories,
  selectedSubCategories,
}: {
  searchQuery: string;
  sortOrder: "asc" | "desc" | "";
  showBestsellers: boolean;
  showNewArrivals: boolean;
  selectedMajorCategories: string[];
  selectedSubCategories: string[];
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const navigate = useNavigate();
  const { settings } = useSettings();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/me`,
          { withCredentials: true }
        );
        setIsLoggedIn(true);
        setUserId(res.data._id);
      } catch (err) {
        setIsLoggedIn(false);
        setUserId(null);
      }
    };

    checkAuth();
  }, []);

  // Fetch cart items if user is logged in
  useEffect(() => {
    if (userId) {
      fetchCartItems();
      fetchWishlist();
    }
  }, [userId]);

  const fetchCartItems = async () => {
    if (!userId) return;

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/cart/${userId}`
      );

      const cartMap: { [key: string]: number } = {};
      data.products.forEach(
        (item: { productId: string | { _id: string }; quantity: number }) => {
          cartMap[
            typeof item.productId === "string"
              ? item.productId
              : item.productId._id
          ] = item.quantity;
        }
      );

      setCartItems(cartMap);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const fetchWishlist = async () => {
    if (!userId) return;

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/wishlist/${userId}`
      );

      setWishlist(
        data.products.map((item: any) =>
          typeof item.productId === "string"
            ? item.productId
            : item.productId._id
        )
      );
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      // If the endpoint doesn't exist yet, we'll handle it silently
      setWishlist([]);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        if (searchQuery) queryParams.append("searchQuery", searchQuery);
        if (sortOrder) queryParams.append("sortOrder", sortOrder);
        if (showBestsellers) queryParams.append("bestsellers", "true");
        if (showNewArrivals) queryParams.append("newArrivals", "true");
        if (selectedMajorCategories.length > 0)
          queryParams.append(
            "majorCategories",
            selectedMajorCategories.join(",")
          );
        if (selectedSubCategories.length > 0)
          queryParams.append("subCategories", selectedSubCategories.join(","));

        const res = await axios.get(
          `${
            import.meta.env.VITE_BASIC_API_URL
          }/products?${queryParams.toString()}`
        );
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    sortOrder,
    showBestsellers,
    showNewArrivals,
    selectedMajorCategories,
    selectedSubCategories,
  ]);

  const addToCart = async (productId: string) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BASIC_API_URL}/cart/add`, {
        userId,
        productId,
        quantity: 1,
      });

      setCartItems((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      }));

      showNotification("Added to cart", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("Failed to add to cart", "error");
    }
  };

  const updateQuantity = async (
    productId: string,
    action: "increase" | "decrease"
  ) => {
    if (!userId) return;

    try {
      await axios.put(
        `${
          import.meta.env.VITE_BASIC_API_URL
        }/cart/${action}/${userId}/${productId}`
      );

      if (action === "increase") {
        setCartItems((prev) => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1,
        }));
      } else {
        setCartItems((prev) => {
          const newQuantity = Math.max(0, (prev[productId] || 0) - 1);
          const newCart = { ...prev };

          if (newQuantity === 0) {
            delete newCart[productId];
          } else {
            newCart[productId] = newQuantity;
          }

          return newCart;
        });
      }
    } catch (error: any) {
      console.error("Error updating cart:", error);
      if (error.response?.data?.error) {
        showNotification(error.response.data.error, "error");
      } else {
        showNotification("Failed to update quantity", "error");
      }
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      if (wishlist.includes(productId)) {
        // Remove from wishlist
        await axios.delete(
          `${
            import.meta.env.VITE_BASIC_API_URL
          }/wishlist/${userId}/${productId}`
        );
        setWishlist((prev) => prev.filter((id) => id !== productId));
        showNotification("Removed from wishlist", "success");
      } else {
        // Add to wishlist
        await axios.post(`${import.meta.env.VITE_BASIC_API_URL}/wishlist/add`, {
          userId,
          productId,
        });
        setWishlist((prev) => [...prev, productId]);
        showNotification("Added to wishlist", "success");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showNotification("Failed to update wishlist", "error");
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const isNewArrival = (createdAt: string) => {
    const productDate = new Date(createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return productDate >= threeDaysAgo;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 p-6 rounded-xl text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );

  if (products.length === 0)
    return (
      <div className="bg-gray-50 p-8 rounded-xl text-center">
        <p className="text-gray-600 mb-2 text-lg">No products found</p>
        <p className="text-gray-500">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );

  return (
    <div>
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
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

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            <div className="relative">
              <img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                {product.isBestseller && (
                  <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    BESTSELLER
                  </span>
                )}
                {isNewArrival(product.createdAt) && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW ARRIVAL
                  </span>
                )}
              </div>
              <button
                className={`absolute top-2 left-2 p-1.5 rounded-full shadow-md transition ${
                  wishlist.includes(product._id)
                    ? "bg-red-100 text-red-500 hover:bg-red-200"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => toggleWishlist(product._id)}
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlist.includes(product._id) ? "fill-red-500" : ""
                  }`}
                />
              </button>
            </div>

            <div className="p-4 flex-grow flex flex-col">
              <div className="flex items-center mb-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.avgRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 ml-1">
                  ({product.avgRating.toFixed(1)})
                </span>
              </div>

              <h2 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                {product.name}
              </h2>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                {product.description}
              </p>

              <div className="text-xs text-gray-500 mb-2">
                {product.majorCategory?.name} › {product.subCategory?.name}
              </div>

              <div className="mt-auto">
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {settings.currencySymbol}
                  {product.price.toLocaleString()}
                </p>
                <p
                  className={`text-xs font-medium mb-2 ${
                    product.stock === 0
                      ? "text-red-600"
                      : product.stock < 5
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {product.stock === 0
                    ? "Out of Stock"
                    : product.stock < 5
                    ? `Only ${product.stock} left`
                    : "In Stock"}
                </p>

                {cartItems[product._id] ? (
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product._id, "decrease")}
                      className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      disabled={product.stock === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-center flex-grow">
                      {cartItems[product._id]}
                    </span>
                    <button
                      onClick={() => updateQuantity(product._id, "increase")}
                      className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      disabled={
                        product.stock === 0 ||
                        cartItems[product._id] >= product.stock
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product._id)}
                    disabled={product.stock === 0}
                    className={`w-full py-2 rounded-lg font-medium text-center transition-colors flex items-center justify-center ${
                      product.stock === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
