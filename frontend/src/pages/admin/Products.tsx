"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, AlertTriangle } from "lucide-react";
import ProductTable from "../../components/admin/ProductTable";
import ProductFilters from "../../components/admin/ProductFilters";
import Pagination from "../../components/admin/Pagination";
import AddProductModal from "../../components/admin/AddProductModal";
import EditProductModal from "../../components/admin/EditProductModal";
import DeleteConfirmationModal from "../../components/admin/DeleteConfirmationModal";
import AdminLayout from "../../layouts/AdminLayout";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isBestseller: boolean;
  avgRating: number;
  imageUrl: string;
  majorCategory: {
    _id: string;
    name: string;
  };
  subCategory: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [showLowStock, setShowLowStock] = useState<boolean>(false);
  const [showBestsellers, setShowBestsellers] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    majorCategory: "",
    subCategory: "",
    isBestseller: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/admin/products`,
          {
            withCredentials: true,
          }
        );
        setProducts(data);
        setFilteredProducts(data);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASIC_API_URL}/admin/categories`,
          {
            withCredentials: true,
          }
        );
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    showLowStock,
    showBestsellers,
    products,
  ]);

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.majorCategory._id === selectedCategory
      );
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(
        (product) => product.subCategory._id === selectedSubCategory
      );
    }

    if (showLowStock) {
      filtered = filtered.filter((product) => product.stock < 10);
    }

    if (showBestsellers) {
      filtered = filtered.filter((product) => product.isBestseller);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setShowLowStock(false);
    setShowBestsellers(false);
  };

  const handleAddProduct = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASIC_API_URL}/admin/products`,
        formData,
        { withCredentials: true }
      );

      // Refresh products list
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/admin/products`,
        {
          withCredentials: true,
        }
      );
      setProducts(data);

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        imageUrl: "",
        majorCategory: "",
        subCategory: "",
        isBestseller: false,
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product. Please try again.");
    }
  };

  const handleEditProduct = async () => {
    if (!currentProduct) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_BASIC_API_URL}/admin/products/${
          currentProduct._id
        }`,
        formData,
        {
          withCredentials: true,
        }
      );

      // Refresh products list
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/admin/products`,
        {
          withCredentials: true,
        }
      );
      setProducts(data);

      // Reset form and close modal
      setCurrentProduct(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating product:", error);
      setError("Failed to update product. Please try again.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASIC_API_URL}/admin/products/${
          currentProduct._id
        }`,
        {
          withCredentials: true,
        }
      );

      // Refresh products list
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/admin/products`,
        {
          withCredentials: true,
        }
      );
      setProducts(data);

      // Reset and close modal
      setCurrentProduct(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product. Please try again.");
    }
  };

  const openEditModal = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      majorCategory: product.majorCategory._id,
      subCategory: product.subCategory._id,
      isBestseller: product.isBestseller,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setCurrentProduct(product);
    setShowDeleteModal(true);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <AdminLayout title="Products">
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Products">
      <div>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Product Management</h2>
            <button
              onClick={() => {
                setFormData({
                  name: "",
                  description: "",
                  price: 0,
                  stock: 0,
                  imageUrl: "",
                  majorCategory: "",
                  subCategory: "",
                  isBestseller: false,
                });
                setShowAddModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Product
            </button>
          </div>

          <ProductFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubCategory={selectedSubCategory}
            setSelectedSubCategory={setSelectedSubCategory}
            showLowStock={showLowStock}
            setShowLowStock={setShowLowStock}
            showBestsellers={showBestsellers}
            setShowBestsellers={setShowBestsellers}
            resetFilters={resetFilters}
            categories={categories}
          />

          <ProductTable
            products={currentItems}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              itemsPerPage={itemsPerPage}
              totalItems={filteredProducts.length}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
      />

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditProduct}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteProduct}
        product={currentProduct}
      />
    </AdminLayout>
  );
};

export default AdminProducts;
