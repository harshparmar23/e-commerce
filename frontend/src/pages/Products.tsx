import { useState, useRef, useEffect } from "react";
import ProductList from "../components/ProductList";
import CategorySelector from "../components/CategorySelector";
import { Search, Star, X, Clock } from "lucide-react";

interface CategorySelection {
  id: string;
  name: string;
}

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [showBestsellers, setShowBestsellers] = useState(false);
  const [showNewArrivals, setShowNewArrivals] = useState(false);
  const [selectedMajorCategory, setSelectedMajorCategory] =
    useState<CategorySelection | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<CategorySelection | null>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number>(0);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Handle category selection from CategorySelector
  const handleCategorySelect = (
    majorCategory: CategorySelection,
    subCategory?: CategorySelection
  ) => {
    setSelectedMajorCategory(majorCategory);
    setSelectedSubCategory(subCategory || null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortOrder("");
    setShowBestsellers(false);
    setShowNewArrivals(false);
    setSelectedMajorCategory(null);
    setSelectedSubCategory(null);
  };

  // Calculate sidebar height on mount and window resize
  useEffect(() => {
    const updateSidebarHeight = () => {
      if (sidebarRef.current) {
        const viewportHeight = window.innerHeight;
        const sidebarTop = sidebarRef.current.getBoundingClientRect().top;
        const availableHeight = viewportHeight - sidebarTop - 20; // 20px padding at bottom
        setSidebarHeight(availableHeight);
      }
    };

    updateSidebarHeight();
    window.addEventListener("resize", updateSidebarHeight);

    return () => {
      window.removeEventListener("resize", updateSidebarHeight);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 pt-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shop Products
          </h1>
          <p className="text-gray-600">
            Discover our collection of high-quality products
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with filters - fixed height with scrolling */}
          <div
            ref={sidebarRef}
            className="lg:col-span-1"
            style={{ height: `${sidebarHeight}px` }}
          >
            <div
              className="space-y-6 overflow-y-auto pr-2 sticky top-4"
              style={{ maxHeight: "100%" }}
            >
              {/* Search Bar */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Search
                </h2>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Category Selector Component */}
              <CategorySelector onCategorySelect={handleCategorySelect} />

              {/* Sort Options */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Sort By
                </h2>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOrder === ""}
                      onChange={() => setSortOrder("")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Default</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOrder === "asc"}
                      onChange={() => setSortOrder("asc")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Price: Low to High</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOrder === "desc"}
                      onChange={() => setSortOrder("desc")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Price: High to Low</span>
                  </label>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Filters
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBestsellers}
                      onChange={() => setShowBestsellers(!showBestsellers)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                      Bestsellers Only
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNewArrivals}
                      onChange={() => setShowNewArrivals(!showNewArrivals)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 text-green-500 mr-1" />
                      New Arrivals
                    </span>
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchQuery ||
                sortOrder ||
                showBestsellers ||
                showNewArrivals ||
                selectedMajorCategory) && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition flex items-center justify-center"
                >
                  <X size={16} className="mr-2" />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Main content area with independent scrolling */}
          <div
            ref={mainContentRef}
            className="lg:col-span-3 overflow-y-auto"
            style={{ maxHeight: `${sidebarHeight}px` }}
          >
            {/* Active Filters Display */}
            {(selectedMajorCategory ||
              selectedSubCategory ||
              showBestsellers ||
              showNewArrivals ||
              sortOrder) && (
              <div className="bg-white p-4 rounded-xl shadow-sm mb-6 sticky top-0 z-10">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Active Filters:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMajorCategory && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center">
                      Category: {selectedMajorCategory.name}
                      <button
                        onClick={() => setSelectedMajorCategory(null)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {selectedSubCategory && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                      Subcategory: {selectedSubCategory.name}
                      <button
                        onClick={() => setSelectedSubCategory(null)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {showBestsellers && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center">
                      Bestsellers Only
                      <button
                        onClick={() => setShowBestsellers(false)}
                        className="ml-1 text-yellow-600 hover:text-yellow-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {showNewArrivals && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                      New Arrivals
                      <button
                        onClick={() => setShowNewArrivals(false)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {sortOrder && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center">
                      Price:{" "}
                      {sortOrder === "asc" ? "Low to High" : "High to Low"}
                      <button
                        onClick={() => setSortOrder("")}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Product List */}
            <ProductList
              searchQuery={searchQuery}
              sortOrder={sortOrder}
              showBestsellers={showBestsellers}
              showNewArrivals={showNewArrivals}
              selectedMajorCategories={
                selectedMajorCategory ? [selectedMajorCategory.id] : []
              }
              selectedSubCategories={
                selectedSubCategory ? [selectedSubCategory.id] : []
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
