// Create a new component for cart items

import { Minus, Plus, Trash2 } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface CartItemProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (productId: string, type: "increase" | "decrease") => void;
  onRemove: (productId: string) => void;
}

const CartItemComponent = ({
  product,
  quantity,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) => {
  return (
    <div className="p-6 flex flex-col sm:flex-row">
      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
        <img
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-md"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
        <p className="text-gray-600 mb-4">₹{product.price.toFixed(2)}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-md">
            <button
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              onClick={() => onUpdateQuantity(product._id, "decrease")}
            >
              <Minus size={16} />
            </button>
            <span className="px-4 py-1 font-medium">{quantity}</span>
            <button
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              onClick={() => onUpdateQuantity(product._id, "increase")}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex items-center">
            <p className="font-semibold mr-4">
              ₹{(product.price * quantity).toFixed(2)}
            </p>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => onRemove(product._id)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;
