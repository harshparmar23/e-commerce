import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import {
  Star,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
  Check,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Info,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

/**
 * Types
 */
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

interface ProductListProps {
  searchQuery: string;
  sortOrder: "asc" | "desc" | "";
  showBestsellers: boolean;
  showNewArrivals: boolean;
  selectedMajorCategories: string[];
  selectedSubCategories: string[];
}

/**
 * Helpers
 */
const formatPrice = (value: number, symbol: string) => {
  // Fallback formatting if currency code is not available
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const relativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
};

const isNewArrival = (createdAt: string) => {
  const productDate = new Date(createdAt);
  const daysLimit = 5;
  const limit = new Date();
  limit.setDate(limit.getDate() - daysLimit);
  return productDate >= limit;
};

/**
 * Star Rating Component (supports halves)
 */
const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div
      className="flex items-center"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {[...Array(5)].map((_, i) => {
        const isFull = i < full;
        const isHalf = i === full && hasHalf;
        return (
          <div key={i} className="relative w-4 h-4">
            <Star
              className={`w-4 h-4 ${
                isFull
                  ? "text-yellow-400 fill-yellow-400"
                  : isHalf
                  ? "text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
            {isHalf && (
              <Star className="w-4 h-4 absolute top-0 left-0 overflow-hidden text-yellow-400 fill-yellow-400 [clip-path:inset(0_50%_0_0)]" />
            )}
          </div>
        );
      })}
      <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

/**
 * Skeleton Loader
 */
const ProductSkeleton = () => {
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
};

/**
 * Notification Toast
 */
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-xl ring-1 backdrop-blur-md transition
      ${
        type === "success"
          ? "bg-green-50/90 ring-green-200 text-green-800 dark:bg-green-500/10 dark:text-green-200 dark:ring-green-500/30"
          : "bg-red-50/90 ring-red-200 text-red-800 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-500/30"
      }`}
      role="alert"
    >
      {type === "success" ? (
        <Check className="w-5 h-5 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 shrink-0" />
      )}
      <div className="text-sm font-medium">{message}</div>
      <button
        onClick={onClose}
        className="ml-2 text-xs opacity-70 hover:opacity-100 transition"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

/**
 * Main Component
 */
export default function ProductList({
  searchQuery,
  sortOrder,
  showBestsellers,
  showNewArrivals,
  selectedMajorCategories,
  selectedSubCategories,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [reloading, setReloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const navigate = useNavigate();
  const { settings } = useSettings();
  setInitialLoading(true);

  /**
   * Authentication check
   */
  useEffect(() => {
    let ignore = false;
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/auth/me`,
          { withCredentials: true }
        );
        if (!ignore) {
          setIsLoggedIn(true);
          setUserId(res.data._id);
        }
      } catch {
        if (!ignore) {
          setIsLoggedIn(false);
          setUserId(null);
        }
      }
    };
    checkAuth();
    return () => {
      ignore = true;
    };
  }, []);

  /**
   * Fetch Cart & Wishlist
   */
  useEffect(() => {
    if (!userId) return;
    fetchCartItems();
    fetchWishlist();
  }, [userId]);

  const fetchCartItems = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/cart/${userId}`
      );
      const cartMap: Record<string, number> = {};
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
    } catch (e) {
      console.error("Error fetching cart items:", e);
    }
  }, [userId]);

  const fetchWishlist = useCallback(async () => {
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
    } catch (e) {
      console.error("Error fetching wishlist:", e);
      setWishlist([]);
    }
  }, [userId]);

  /**
   * Fetch Products
   */
  useEffect(() => {
    const fetchProducts = async () => {
      setReloading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append("searchQuery", searchQuery);
        if (sortOrder) queryParams.append("sortOrder", sortOrder);
        if (showBestsellers) queryParams.append("bestsellers", "true");
        if (showNewArrivals) queryParams.append("newArrivals", "true");
        if (selectedMajorCategories.length > 0) {
          queryParams.append(
            "majorCategories",
            selectedMajorCategories.join(",")
          );
        }
        if (selectedSubCategories.length > 0) {
          queryParams.append("subCategories", selectedSubCategories.join(","));
        }

        const base = import.meta.env.VITE_BASIC_API_URL;
        if (!base) {
          console.warn("[ProductList] VITE_BASIC_API_URL is undefined!");
        }

        const fullUrl = `${base}/products?${queryParams.toString()}`;
        console.log("[ProductList] Fetching:", fullUrl);

        const res = await axios.get(fullUrl);
        console.log("[ProductList] Response:", res.status, res.data);
        setProducts(res.data);
      } catch (err: any) {
        console.error("[ProductList] Fetch error:", err?.response || err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch products"
        );
      } finally {
        setReloading(false);
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

  /**
   * Cart Operations
   */
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
    } catch (e) {
      console.error("Error adding to cart:", e);
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
      setCartItems((prev) => {
        if (action === "increase") {
          return {
            ...prev,
            [productId]: (prev[productId] || 0) + 1,
          };
        } else {
          const newQuantity = Math.max(0, (prev[productId] || 0) - 1);
          const copy = { ...prev };
          if (newQuantity === 0) delete copy[productId];
          else copy[productId] = newQuantity;
          return copy;
        }
      });
    } catch (e) {
      const err = e as AxiosError<any>;
      console.error("Error updating cart:", e);
      if (err.response?.data?.error) {
        showNotification(err.response.data.error, "error");
      } else {
        showNotification("Failed to update quantity", "error");
      }
    }
  };

  /**
   * Wishlist
   */
  const toggleWishlist = async (productId: string) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      if (wishlist.includes(productId)) {
        await axios.delete(
          `${
            import.meta.env.VITE_BASIC_API_URL
          }/wishlist/${userId}/${productId}`
        );
        setWishlist((prev) => prev.filter((id) => id !== productId));
        showNotification("Removed from wishlist", "success");
      } else {
        await axios.post(`${import.meta.env.VITE_BASIC_API_URL}/wishlist/add`, {
          userId,
          productId,
        });
        setWishlist((prev) => [...prev, productId]);
        showNotification("Added to wishlist", "success");
      }
    } catch (e) {
      console.error("Error updating wishlist:", e);
      showNotification("Failed to update wishlist", "error");
    }
  };

  /**
   * Notification
   */
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  /**
   * Derived
   */
  const totalFound = products.length;
  const bestCount = products.filter((p) => p.isBestseller).length;
  const newCount = products.filter((p) => isNewArrival(p.createdAt)).length;

  const currencySymbol = settings.currencySymbol || "$";

  /**
   * UI Render Helpers
   */
  const renderAddToCart = (product: Product) => {
    const inCart = cartItems[product._id];
    if (inCart) {
      return (
        <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => updateQuantity(product._id, "decrease")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
            disabled={product.stock === 0}
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="flex-grow text-center font-semibold select-none text-sm">
            {cartItems[product._id]}
          </span>
          <button
            onClick={() => updateQuantity(product._id, "increase")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
            disabled={
              product.stock === 0 || cartItems[product._id] >= product.stock
            }
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => addToCart(product._id)}
        disabled={product.stock === 0}
        className={`group relative w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-sm transition 
          ${
            product.stock === 0
              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow hover:shadow-md hover:brightness-[1.05] active:scale-[.985]"
          }`}
        aria-label="Add to cart"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
        <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-white/10"></span>
      </button>
    );
  };

  /**
   * States
   */
  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative rounded-2xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 p-10 text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-300" />
        </div>
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">
          We couldn&apos;t load products
        </h2>
        <p className="text-red-600/80 dark:text-red-400/80 text-sm max-w-md mx-auto">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 px-5 py-2.5 text-white font-medium shadow hover:shadow-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="relative rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-12 text-center space-y-5 shadow-inner">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/10 flex items-center justify-center shadow">
          <Sparkles className="w-9 h-9 text-blue-600 dark:text-blue-300" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
          No products match your filters
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Try adjusting your search or removing some filters to discover more
          items.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/70 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast / Notification */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>

      {/* Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm">
            <Info className="w-4 h-4 text-blue-500" />
            Showing {totalFound} product{totalFound !== 1 && "s"}
          </span>
          {bestCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-semibold px-3 py-1 shadow">
              <TrendingUp className="w-3.5 h-3.5" />
              {bestCount} Bestseller{bestCount !== 1 && "s"}
            </span>
          )}
          {newCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold px-3 py-1 shadow">
              <Sparkles className="w-3.5 h-3.5" />
              {newCount} New
            </span>
          )}
        </div>
        {reloading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => {
          const wishlisted = wishlist.includes(product._id);
          const lowStock = product.stock > 0 && product.stock < 5;
          const newArrival = isNewArrival(product.createdAt);
          const out = product.stock === 0;

          return (
            <div
              key={product._id}
              className={`group relative flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300
                motion-safe:hover:scale-[1.015]`}
              onMouseEnter={() => setHovered(product._id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Image Section */}
              <div className="relative">
                <div className="overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-800">
                  <img
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    loading="lazy"
                    className={`w-full aspect-[4/5] object-cover object-center transition duration-500 
                      group-hover:scale-105`}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-t from-black via-black/20 to-transparent transition pointer-events-none" />
                </div>

                {/* Action overlay on hover */}
                <div
                  className={`absolute inset-x-0 bottom-0 p-3 flex flex-col gap-2 transform transition-all duration-300 ${
                    hovered === product._id
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0"
                  }`}
                >
                  {/* Quick info */}
                  <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
                    <span className="px-2 py-1 rounded-md backdrop-blur bg-black/40">
                      {relativeTime(product.createdAt)}
                    </span>
                    {product.stock > 0 && (
                      <span className="px-2 py-1 rounded-md backdrop-blur bg-black/40">
                        {product.stock} in stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                  {product.isBestseller && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                      <Star className="w-3 h-3 fill-white" /> Bestseller
                    </span>
                  )}
                  {newArrival && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                      <Sparkles className="w-3 h-3" /> New
                    </span>
                  )}
                  {lowStock && !out && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product._id)}
                  aria-label={
                    wishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                  className={`absolute top-3 left-3 z-10 rounded-full p-2 backdrop-blur-md border
                    ${
                      wishlisted
                        ? "bg-red-500/90 border-red-400 text-white shadow"
                        : "bg-white/80 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                    } hover:scale-110 active:scale-95 transition shadow-sm`}
                >
                  <Heart
                    className={`w-4 h-4 transition ${
                      wishlisted ? "fill-current" : ""
                    }`}
                  />
                </button>

                {/* Out of stock overlay */}
                {out && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <span className="text-white font-semibold text-sm tracking-wide px-4 py-2 rounded-full bg-white/10 border border-white/20">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col p-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3
                      title={product.name}
                      className="text-base font-semibold text-gray-900 dark:text-gray-100 tracking-tight line-clamp-1"
                    >
                      {product.name}
                    </h3>
                    <p
                      title={product.description}
                      className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2"
                    >
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <StarRating rating={product.avgRating || 0} />
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-500">
                    {product.majorCategory?.name} › {product.subCategory?.name}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {formatPrice(product.price, currencySymbol)}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        out
                          ? "text-red-600 dark:text-red-400"
                          : lowStock
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {out
                        ? "Out of Stock"
                        : lowStock
                        ? `Only ${product.stock} left`
                        : "In Stock"}
                    </span>
                  </div>

                  {renderAddToCart(product)}
                </div>
              </div>

              {/* Subtle border glow */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/0 group-hover:to-indigo-500/10 blur-[1px]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
