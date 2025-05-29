import React from 'react';
import { useParams } from 'react-router-dom';

const VendorProducts = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Vendor Products</h1>
      <p className="text-gray-600">Products for vendor ID: {id}</p>
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">No products found for this vendor.</p>
      </div>
    </div>
  );
};

export default VendorProducts;
