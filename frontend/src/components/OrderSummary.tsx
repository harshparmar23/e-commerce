import { ChevronRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

// Update the interface to match how it's being used
interface OrderSummaryProps {
  subtotal: number;
  shipping: number; // This is correct, but being used as shippingFee
  tax: number;
  discount?: number;
  couponCode?: string;
  total: number;
  onCheckout?: () => void;
  buttonText?: string;
  isCheckoutDisabled?: boolean;
  isLoading?: boolean; // Add this property as it seems to be used
}

const OrderSummary = ({
  subtotal,
  shipping, // This is the correct prop name
  tax,
  discount = 0,
  couponCode,
  total,
  onCheckout,
  buttonText = "Proceed to Checkout",
  isCheckoutDisabled = false,
  isLoading = false, // Add default value
}: OrderSummaryProps) => {
  const { settings } = useSettings();

  // Calculate total
  // const totalAmount = subtotal + shippingFee - discountAmount; // No longer needed

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
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
          {shipping > 0 ? (
            <span className="font-medium">
              {settings.currencySymbol}
              {shipping.toFixed(2)}
            </span>
          ) : (
            <span className="font-medium text-green-600">Free</span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">
            {settings.currencySymbol}
            {tax.toFixed(2)}
          </span>
        </div>
        {discount > 0 && couponCode && (
          <div className="flex justify-between py-2">
            <span>Discount ({couponCode})</span>
            <span className="text-green-600">-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-4 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-lg">
            {settings.currencySymbol}
            {total.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="p-6">
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          onClick={onCheckout}
          disabled={isCheckoutDisabled}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          ) : null}
          {buttonText}
          <ChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
