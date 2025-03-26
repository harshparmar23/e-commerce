import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Star, X } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  majorCategory: string;
}

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (subCategoryId: string) => void;
  showLowStock: boolean;
  setShowLowStock: (show: boolean) => void;
  showBestsellers: boolean;
  setShowBestsellers: (show: boolean) => void;
  resetFilters: () => void;
  categories: Category[];
}

const ProductFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  showLowStock,
  setShowLowStock,
  showBestsellers,
  setShowBestsellers,
  resetFilters,
  categories,
}: ProductFiltersProps) => {
  const [availableSubCategories, setAvailableSubCategories] = useState<
    SubCategory[]
  >([]);
  const [loadingSubcategories, setLoadingSubcategories] =
    useState<boolean>(false);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setAvailableSubCategories([]);
        setSelectedSubCategory("");
        return;
      }

      try {
        setLoadingSubcategories(true);
        const { data } = await axios.get(
          `${
            import.meta.env.VITE_BASIC_API_URL
          }/subcategories/${selectedCategory}`,
          {
            withCredentials: true,
          }
        );
        setAvailableSubCategories(data);

        // Reset subcategory selection if the current selection is not valid for the new category
        if (
          selectedSubCategory &&
          !data.some(
            (subCat: SubCategory) => subCat._id === selectedSubCategory
          )
        ) {
          setSelectedSubCategory("");
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setAvailableSubCategories([]);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubCategories();
  }, [selectedCategory, selectedSubCategory, setSelectedSubCategory]);

  return (
    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="relative flex-grow max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSubCategory}
          onChange={(e) => setSelectedSubCategory(e.target.value)}
          className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !selectedCategory ? "opacity-60 cursor-not-allowed" : ""
          } ${loadingSubcategories ? "animate-pulse" : ""}`}
          disabled={!selectedCategory || loadingSubcategories}
          aria-label="Filter by subcategory"
        >
          <option value="">
            {loadingSubcategories
              ? "Loading subcategories..."
              : selectedCategory
              ? "All Subcategories"
              : "Select a category first"}
          </option>
          {availableSubCategories.map((subCategory) => (
            <option key={subCategory._id} value={subCategory._id}>
              {subCategory.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`px-3 py-2 rounded-lg border ${
            showLowStock
              ? "bg-yellow-100 border-yellow-300 text-yellow-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          aria-pressed={showLowStock}
          aria-label="Show low stock items"
        >
          <Filter className="inline-block h-4 w-4 mr-1" />
          Low Stock
        </button>

        <button
          onClick={() => setShowBestsellers(!showBestsellers)}
          className={`px-3 py-2 rounded-lg border ${
            showBestsellers
              ? "bg-yellow-100 border-yellow-300 text-yellow-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          aria-pressed={showBestsellers}
          aria-label="Show bestsellers"
        >
          <Star className="inline-block h-4 w-4 mr-1" />
          Bestsellers
        </button>

        {(searchQuery ||
          selectedCategory ||
          selectedSubCategory ||
          showLowStock ||
          showBestsellers) && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            aria-label="Clear filters"
          >
            <X className="inline-block h-4 w-4 mr-1" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
