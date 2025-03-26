import { useState, useEffect } from "react";
import axios from "axios";
import { useSettings } from "@/context/SettingsContext";

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  majorCategory: string;
}

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

interface ProductFormProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  categories: Category[];
  isEdit?: boolean;
}

const ProductForm = ({
  formData,
  setFormData,
  categories,
  isEdit = false,
}: ProductFormProps) => {
  const [availableSubCategories, setAvailableSubCategories] = useState<
    SubCategory[]
  >([]);
  const [loadingSubcategories, setLoadingSubcategories] =
    useState<boolean>(false);

  const { settings } = useSettings();

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.majorCategory) {
        setAvailableSubCategories([]);
        setFormData({
          ...formData,
          subCategory: "",
        });
        return;
      }

      try {
        setLoadingSubcategories(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/subcategories/${
            formData.majorCategory
          }`,
          { withCredentials: true }
        );
        setAvailableSubCategories(data);

        // Reset subcategory selection if the current selection is not valid for the new category
        if (
          formData.subCategory &&
          !data.some(
            (subCat: SubCategory) => subCat._id === formData.subCategory
          )
        ) {
          setFormData({
            ...formData,
            subCategory: "",
          });
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setAvailableSubCategories([]);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubCategories();
  }, [formData.majorCategory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter product name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price ({settings.currencySymbol})
        </label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData({
              ...formData,
              price: Number.parseFloat(e.target.value) || 0,
            })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock Quantity
        </label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) =>
            setFormData({
              ...formData,
              stock: Number.parseInt(e.target.value) || 0,
            })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
          min="0"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={formData.majorCategory}
          onChange={(e) => {
            setFormData({
              ...formData,
              majorCategory: e.target.value,
              subCategory: "",
            });
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subcategory
        </label>
        <select
          value={formData.subCategory}
          onChange={(e) =>
            setFormData({ ...formData, subCategory: e.target.value })
          }
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !formData.majorCategory || loadingSubcategories
              ? "opacity-60 cursor-not-allowed"
              : ""
          } ${loadingSubcategories ? "animate-pulse" : ""}`}
          disabled={!formData.majorCategory || loadingSubcategories}
          required
        >
          <option value="">
            {loadingSubcategories
              ? "Loading subcategories..."
              : formData.majorCategory
              ? "Select Subcategory"
              : "Select a category first"}
          </option>
          {availableSubCategories.map((subCategory) => (
            <option key={subCategory._id} value={subCategory._id}>
              {subCategory.name}
            </option>
          ))}
        </select>
        {!formData.majorCategory && (
          <p className="text-xs text-gray-500 mt-1">
            Please select a category first
          </p>
        )}
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={isEdit ? "isBestsellerEdit" : "isBestseller"}
          checked={formData.isBestseller}
          onChange={(e) =>
            setFormData({
              ...formData,
              isBestseller: e.target.checked,
            })
          }
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor={isEdit ? "isBestsellerEdit" : "isBestseller"}
          className="ml-2 block text-sm text-gray-900"
        >
          Mark as Bestseller
        </label>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter product description"
          required
        ></textarea>
      </div>
    </div>
  );
};

export default ProductForm;
