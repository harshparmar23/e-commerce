import type React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "@/layouts/AdminLayout";
import Pagination from "@/components/admin/Pagination";
import { Edit, Trash2, Plus, X } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: "fixed" | "percentage" | "dynamic";
  discountAmount: number;
  minimumAmount: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  expiryDate: string;
}

const Coupons = () => {
  const { settings } = useSettings();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "fixed",
    discountAmount: 0,
    minimumAmount: 0,
    usageLimit: 1,
    active: true,
    expiryDate: new Date().toISOString().split("T")[0],
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASIC_API_URL}/coupons`,
        {
          withCredentials: true,
        }
      );

      // Ensure we're working with an array
      const couponsData = Array.isArray(response.data)
        ? response.data
        : response.data.coupons || [];

      setCoupons(couponsData);
      setTotalPages(Math.ceil(couponsData.length / itemsPerPage));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Failed to fetch coupons");
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openModal = (coupon: Coupon | null = null) => {
    if (coupon) {
      // Format date for input field
      const formattedDate = new Date(coupon.expiryDate)
        .toISOString()
        .split("T")[0];

      setFormData({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        minimumAmount: coupon.minimumAmount,
        usageLimit: coupon.usageLimit,
        active: coupon.active,
        expiryDate: formattedDate,
      });
      setEditingCoupon(coupon);
    } else {
      setFormData({
        code: "",
        description: "",
        discountType: "fixed",
        discountAmount: 0,
        minimumAmount: 0,
        usageLimit: 1,
        active: true,
        expiryDate: new Date().toISOString().split("T")[0],
      });
      setEditingCoupon(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Validate form data
      if (!formData.code.trim()) {
        setError("Coupon code is required");
        return;
      }

      if (
        formData.discountType !== "dynamic" &&
        (!formData.discountAmount || formData.discountAmount <= 0)
      ) {
        setError("Please enter a valid discount amount");
        return;
      }

      if (formData.minimumAmount < 0) {
        setError("Minimum amount cannot be negative");
        return;
      }

      if (formData.usageLimit < 1) {
        setError("Usage limit must be at least 1");
        return;
      }

      if (editingCoupon) {
        await axios.put(
          `${import.meta.env.VITE_BASIC_API_URL}/coupons/${editingCoupon._id}`,
          formData,
          {
            withCredentials: true,
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_BASIC_API_URL}/coupons`,
          formData,
          { withCredentials: true }
        );
      }

      closeModal();
      fetchCoupons();
    } catch (err: any) {
      console.error("Error saving coupon:", err);
      setError(err.response?.data?.error || "Failed to save coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BASIC_API_URL}/coupons/${id}`,
          {
            withCredentials: true,
          }
        );
        fetchCoupons();
      } catch (err) {
        console.error("Error deleting coupon:", err);
        setError("Failed to delete coupon");
      }
    }
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Calculate pagination indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoupons = coupons.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <AdminLayout title="Manage Coupons">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Coupons</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus size={16} className="mr-1" /> Add Coupon
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Code</th>
                    <th className="py-3 px-6 text-left">Description</th>
                    <th className="py-3 px-6 text-left">Type</th>
                    <th className="py-3 px-6 text-left">Discount</th>
                    <th className="py-3 px-6 text-left">Min. Amount</th>
                    <th className="py-3 px-6 text-left">Usage</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Expires</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {currentCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-4 px-6 text-center">
                        No coupons found
                      </td>
                    </tr>
                  ) : (
                    currentCoupons.map((coupon) => (
                      <tr
                        key={coupon._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-6 text-left">{coupon.code}</td>
                        <td className="py-3 px-6 text-left">
                          {coupon.description}
                        </td>
                        <td className="py-3 px-6 text-left capitalize">
                          {coupon.discountType}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountAmount}%`
                            : coupon.discountType === "dynamic"
                            ? "Dynamic"
                            : `${settings.currencySymbol}${coupon.discountAmount}`}
                        </td>
                        <td className="py-3 px-6 text-left">
                          ${coupon.minimumAmount}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {coupon.usedCount} / {coupon.usageLimit}
                        </td>
                        <td className="py-3 px-6 text-left">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              coupon.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {coupon.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-left">
                          {coupon.expiryDate
                            ? new Date(coupon.expiryDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <div className="flex item-center justify-center">
                            <button
                              onClick={() => openModal(coupon)}
                              className="transform hover:text-blue-500 hover:scale-110 mr-3"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(coupon._id)}
                              className="transform hover:text-red-500 hover:scale-110"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
                itemsPerPage={itemsPerPage}
                totalItems={coupons.length}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
              />
            )}
          </>
        )}
      </div>

      {/* Add/Edit Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold">
                {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code*
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!!editingCoupon}
                  />
                  {formData.discountType === "dynamic" &&
                    formData.code.startsWith("FLAT") && (
                      <p className="text-xs text-gray-500 mt-1">
                        For dynamic "FLAT" coupons, the number after "FLAT" will
                        be the discount amount
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type*
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                    <option value="dynamic">Dynamic (FLAT150 type)</option>
                  </select>
                </div>

                {formData.discountType !== "dynamic" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Amount*
                    </label>
                    <input
                      type="number"
                      name="discountAmount"
                      value={formData.discountAmount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      step={
                        formData.discountType === "percentage" ? "0.01" : "1"
                      }
                      required={formData.discountType !== "dynamic"}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Amount*
                  </label>
                  <input
                    type="number"
                    name="minimumAmount"
                    value={formData.minimumAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit*
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date*
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="active"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Coupons;
