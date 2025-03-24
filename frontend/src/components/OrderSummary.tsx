// Create a new component for order summary
"use client";

import { ChevronRight } from "lucide-react";

interface OrderSummaryProps {
  subtotal: number;
  isLoading: boolean;
  isCheckoutDisabled: boolean;
  onCheckout: () => void;
}

const OrderSummary = ({
  subtotal,
  isLoading,
  isCheckoutDisabled,
  onCheckout,
}: OrderSummaryProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Order Summary</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">Free</span>
        </div>
        <div className="border-t pt-4 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-lg">₹{subtotal.toFixed(2)}</span>
        </div>
      </div>
      <div className="p-6">
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          onClick={onCheckout}
          disabled={isCheckoutDisabled || isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          ) : null}
          Proceed to Checkout
          <ChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
