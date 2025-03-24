"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  MapPin,
  Plus,
  Minus,
  Trash2,
  Gift,
  ChevronRight,
  AlertCircle,
  Check,
} from "lucide-react";
import Cookies from "js-cookie";
import { useSettings } from "../context/SettingsContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface CartItem {
  productId: Product;
  quantity: number;
}

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  addresses: Address[];
}

const Cart = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState<boolean>(false);
  const [isGift, setIsGift] = useState<boolean>(false);
  const [giftMessage, setGiftMessage] = useState<string>("");
  const [paymentMethod, setPaymentMethod] =
    useState<string>("cash_on_delivery");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, "_id">>({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  const { settings } = useSettings();

  // const leftColumnRef = useRef<HTMLDivElement>(null);
  // const rightColumnRef = useRef<HTMLDivElement>(null);
  const [columnHeight, setColumnHeight] = useState<number>(0);

  useEffect(() => {
    const updateColumnHeight = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 150; // Approximate height of the header
      const availableHeight = viewportHeight - headerHeight - 40; // 40px for padding
      setColumnHeight(availableHeight);
      console.log(columnHeight);
    };

    updateColumnHeight();
    window.addEventListener("resize", updateColumnHeight);

    return () => {
      window.removeEventListener("resize", updateColumnHeight);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
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
        setUser(res.data);
        setUserId(res.data._id);

        if (res.data.addresses.length > 0) {
          setSelectedAddress(res.data.addresses[0]._id);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/cart/${userId}`
      );
      setCartItems(data.products);
    } catch (error) {
      console.error("Error fetching cart", error);
      setErrorMessage("Failed to load your cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (
    productId: string,
    type: "increase" | "decrease"
  ) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_BASIC_API_URL
        }/cart/${type}/${userId}/${productId}`
      );
      setErrorMessage(null);
      fetchCart();
    } catch (error: any) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        console.error("Error updating cart", error);
        setErrorMessage("Failed to update quantity. Please try again.");
      }
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASIC_API_URL}/cart/${userId}/${productId}`
      );
      setSuccessMessage("Item removed from cart");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchCart();
    } catch (error) {
      console.error("Error removing item", error);
      setErrorMessage("Failed to remove item. Please try again.");
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASIC_API_URL}/cart/${userId}`
      );
      setCartItems([]);
      setSuccessMessage("Cart cleared successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error clearing cart", error);
      setErrorMessage("Failed to clear cart. Please try again.");
    }
  };

  const handleAddAddress = async () => {
    try {
      // Validate address fields
      if (
        !newAddress.street ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.country ||
        !newAddress.zipCode
      ) {
        setErrorMessage("Please fill in all address fields");
        return;
      }

      setIsLoading(true);

      // Get token from cookies
      const token = Cookies.get("token");

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASIC_API_URL}/users/${userId}/address`,
        newAddress,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update user state with new address
      setUser((prev) =>
        prev ? { ...prev, addresses: [...prev.addresses, data] } : prev
      );
      setSelectedAddress(data._id);

      // Reset form
      setNewAddress({
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      });
      setShowAddressDialog(false);
      setErrorMessage(null);
      setSuccessMessage("Address added successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Error adding address", error);
      if (error.response) {
        setErrorMessage(
          `Failed to add address: ${error.response.data.error || error.message}`
        );
      } else {
        setErrorMessage(`Failed to add address: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setErrorMessage("Please select or add an address before checkout.");
      return;
    }

    try {
      setIsLoading(true);
      const token = Cookies.get("token");

      await axios.post(
        `${import.meta.env.VITE_BASIC_API_URL}/orders`,
        {
          addressId: selectedAddress,
          isGift,
          giftMessage: isGift ? giftMessage : "",
          paymentMethod,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Order placed successfully!");

      // Clear the cart after successful order
      setCartItems([]);

      // Redirect to orders page after a short delay
      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (error) {
      console.error("Error during checkout", error);
      setErrorMessage("Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, { productId, quantity }) => acc + productId.price * quantity,
    0
  );

  // Calculate shipping fee based on free shipping threshold
  const shippingFee =
    subtotal < settings.freeShippingThreshold ? settings.shippingFee : 0;

  // Calculate total cost including shipping
  const totalCost = subtotal + shippingFee;

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center">
          <ShoppingBag className="mr-2" /> Your Shopping Cart
        </h1>
        <p className="text-gray-600 mb-8">
          Review your items and proceed to checkout
        </p>

        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md flex items-start">
            <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {isLoading && cartItems.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="flex justify-center mb-4">
              <ShoppingBag className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">
                    Cart Items ({cartItems.length})
                  </h2>
                </div>
                <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
                  {cartItems.map(({ productId, quantity }) => (
                    <div
                      key={productId._id}
                      className="p-6 flex flex-col sm:flex-row"
                    >
                      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                        <img
                          src={productId.imageUrl || "/placeholder.svg"}
                          alt={productId.name}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-lg mb-1">
                          {productId.name}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {settings.currencySymbol}
                          {productId.price.toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              onClick={() =>
                                updateQuantity(productId._id, "decrease")
                              }
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-1 font-medium">
                              {quantity}
                            </span>
                            <button
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              onClick={() =>
                                updateQuantity(productId._id, "increase")
                              }
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <div className="flex items-center">
                            <p className="font-semibold mr-4">
                              {settings.currencySymbol}
                              {(productId.price * quantity).toFixed(2)}
                            </p>
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeItem(productId._id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-gray-50 flex justify-between items-center">
                  <button
                    className="text-red-500 hover:text-red-700 flex items-center"
                    onClick={clearCart}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Clear Cart
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => navigate("/products")}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Order Summary</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        {settings.currencySymbol}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      {shippingFee > 0 ? (
                        <span className="font-medium">
                          {settings.currencySymbol}
                          {shippingFee.toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-medium text-green-600">Free</span>
                      )}
                    </div>
                    {shippingFee > 0 && (
                      <div className="text-xs text-gray-500 italic">
                        Add {settings.currencySymbol}
                        {(settings.freeShippingThreshold - subtotal).toFixed(
                          2
                        )}{" "}
                        more to qualify for free shipping
                      </div>
                    )}
                    <div className="border-t pt-4 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">
                        {settings.currencySymbol}
                        {totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold flex items-center">
                      <MapPin className="mr-2" size={20} />
                      Shipping Address
                    </h2>
                    <button
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                      onClick={() => setShowAddressDialog(true)}
                    >
                      <Plus size={16} className="mr-1" />
                      Add New
                    </button>
                  </div>
                  <div className="p-6">
                    {user.addresses.length > 0 ? (
                      <div className="space-y-4">
                        {user.addresses.map((address) => (
                          <label
                            key={address._id}
                            className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedAddress === address._id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start">
                              <input
                                type="radio"
                                name="address"
                                className="mt-1 mr-3"
                                checked={selectedAddress === address._id}
                                onChange={() => setSelectedAddress(address._id)}
                              />
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-gray-600 text-sm mt-1">
                                  {address.street}, {address.city},{" "}
                                  {address.state}, {address.country},{" "}
                                  {address.zipCode}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">No saved addresses</p>
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          onClick={() => setShowAddressDialog(true)}
                        >
                          Add Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gift Option */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Gift className="mr-2" size={20} />
                      Gift Options
                    </h2>
                  </div>
                  <div className="p-6">
                    <label className="flex items-center mb-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGift}
                        onChange={() => setIsGift(!isGift)}
                        className="mr-3 h-5 w-5 text-blue-600"
                      />
                      <span className="text-gray-800">
                        This order is a gift
                      </span>
                    </label>

                    {isGift && (
                      <div className="mt-4">
                        <label className="block text-gray-700 mb-2">
                          Gift Message:
                        </label>
                        <textarea
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add your gift message here..."
                          rows={3}
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Payment Method</h2>
                  </div>
                  <div className="p-6">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash_on_delivery">Cash on Delivery</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  onClick={handleCheckout}
                  disabled={!selectedAddress || isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : null}
                  Proceed to Checkout
                  <ChevronRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Dialog */}
      {showAddressDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add New Address</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St"
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, street: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New York"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="NY"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="USA"
                  value={newAddress.country}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, country: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10001"
                  value={newAddress.zipCode}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, zipCode: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                onClick={() => {
                  setShowAddressDialog(false);
                  setErrorMessage(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                onClick={handleAddAddress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Address"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
