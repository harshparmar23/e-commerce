import type React from "react";

import { useState } from "react";
import axios from "axios";
import { Tag, X } from "lucide-react";

// Update the interface
interface CouponFormProps {
  subtotal: number;
  onValidateCoupon: (couponData: {
    code: string;
    discountAmount: number;
    finalAmount: number;
  }) => void;
  onRemoveCoupon: () => void;
  appliedCoupon: {
    code: string;
    discountAmount: number;
  } | null;
}

// Update the component props
const CouponForm = ({
  subtotal,
  onValidateCoupon,
  onRemoveCoupon,
  appliedCoupon,
}: CouponFormProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleValidateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Make sure we're using the correct API URL
      const apiUrl = import.meta.env.VITE_BASIC_API_URL;

      const response = await axios.post(
        `${apiUrl}/coupons/validate`,
        { code: couponCode, orderAmount: subtotal },
        { withCredentials: true }
      );

      const { coupon, discountAmount, finalAmount } = response.data;

      // Only validate the coupon, don't apply it yet
      onValidateCoupon({
        code: coupon.code,
        discountAmount,
        finalAmount,
      });

      // Don't update coupon usage count here, it will be done during checkout

      setSuccess(
        `Coupon validated successfully! You will save ${discountAmount.toFixed(
          2
        )} at checkout.`
      );
      setCouponCode("");
    } catch (err: any) {
      console.error("Error validating coupon:", err);
      setError(err.response?.data?.error || "Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
    setSuccess("");
    setError("");
  };

  return (
    <div className="mt-4 mb-6">
      <h3 className="text-lg font-medium mb-2">Apply Coupon</h3>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
          <div className="flex items-center">
            <Tag size={18} className="text-blue-600 mr-2" />
            <div>
              <p className="font-medium">{appliedCoupon.code}</p>
              <p className="text-sm text-green-600">
                Discount: ${appliedCoupon.discountAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-gray-500 hover:text-red-500"
            aria-label="Remove coupon"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleValidateCoupon} className="flex space-x-2">
          <div className="flex-grow">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Validating..." : "Validate"}
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </div>
  );
};

export default CouponForm;
