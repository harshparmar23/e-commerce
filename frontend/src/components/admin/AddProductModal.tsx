import { X, Plus } from "lucide-react";
import ProductForm from "./ProductForm";

interface Category {
  _id: string;
  name: string;
}

// interface SubCategory {
//   _id: string;
//   name: string;
//   majorCategory: string;
// }

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  majorCategory: string;
  subCategory: string;
  isBestseller: boolean;
}

// Update the interface to remove the subCategories prop requirement
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  categories: Category[];
}

// Update the component props destructuring to remove subCategories
const AddProductModal = ({
  isOpen,
  onClose,
  onAdd,
  formData,
  setFormData,
  categories,
}: AddProductModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">Add New Product</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
