"use client"

import { X, AlertTriangle } from "lucide-react"

interface Product {
  _id: string
  name: string
}

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  product: Product | null
}

const DeleteConfirmationModal = ({ isOpen, onClose, onDelete, product }: DeleteConfirmationModalProps) => {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Confirm Delete</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{product.name}</span>? This action cannot
              be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal

