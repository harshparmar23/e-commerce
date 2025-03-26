// Create a new component for address selection

import { Plus } from "lucide-react";

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface AddressSelectorProps {
  addresses: Address[];
  userName: string;
  selectedAddress: string | null;
  onSelectAddress: (addressId: string) => void;
  onAddNewClick: () => void;
}

const AddressSelector = ({
  addresses,
  userName,
  selectedAddress,
  onSelectAddress,
  onAddNewClick,
}: AddressSelectorProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shipping Address</h2>
        <button
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
          onClick={onAddNewClick}
        >
          <Plus size={16} className="mr-1" />
          Add New
        </button>
      </div>
      <div className="p-6">
        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => (
              <label
                key={address._id}
                className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAddress === address._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    name="address"
                    className="mt-1 mr-3"
                    checked={selectedAddress === address._id}
                    onChange={() => onSelectAddress(address._id)}
                  />
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {address.street}, {address.city}, {address.state},{" "}
                      {address.country}, {address.zipCode}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No saved addresses</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={onAddNewClick}
            >
              Add Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSelector;
