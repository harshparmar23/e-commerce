import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  majorCategory: string;
}

interface CategorySelection {
  id: string;
  name: string;
}

export default function CategorySelector({
  onCategorySelect,
}: {
  onCategorySelect: (
    majorCategory: CategorySelection,
    subCategory?: CategorySelection
  ) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/categories`
        );
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = async (category: Category) => {
    setSelectedCategory(category._id);
    onCategorySelect({ id: category._id, name: category.name });

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/subcategories/${category._id}`
      );
      setSubCategories(res.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse text-gray-500">
                Loading categories...
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 pb-3">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category._id
                      ? "bg-blue-600 text-white shadow-md transform scale-105"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {selectedCategory && subCategories.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-md font-medium text-gray-700 mb-3">
                Subcategories
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subCategories.map((subCategory) => (
                  <button
                    key={subCategory._id}
                    onClick={() =>
                      onCategorySelect(
                        {
                          id: selectedCategory,
                          name:
                            categories.find((c) => c._id === selectedCategory)
                              ?.name || "",
                        },
                        { id: subCategory._id, name: subCategory.name }
                      )
                    }
                    className="bg-gray-50 p-2 rounded-lg text-sm hover:bg-gray-100 transition border border-gray-200 text-gray-700 flex items-center justify-center"
                  >
                    {subCategory.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
