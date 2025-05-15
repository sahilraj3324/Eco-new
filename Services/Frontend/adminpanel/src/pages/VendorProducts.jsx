import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

// Mock data - would be replaced with API calls
const mockVendors = {
  1: { id: 1, name: 'Eco Friendly Products Inc.', email: 'contact@ecofriendly.com' },
  2: { id: 2, name: 'Green Living Solutions', email: 'info@greenliving.com' },
  3: { id: 3, name: 'Sustainable Goods Co.', email: 'sales@sustainablegoods.com' },
  4: { id: 4, name: 'Earth First Supplies', email: 'support@earthfirst.com' },
  5: { id: 5, name: 'Organic Materials Ltd.', email: 'hello@organicmaterials.com' },
  6: { id: 6, name: 'Eco Innovations', email: 'info@ecoinnovations.com' },
}

const mockProducts = {
  1: [
    { id: 101, name: 'Bamboo Toothbrush', price: 4.99, stock: 120, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
    { id: 102, name: 'Reusable Water Bottle', price: 19.99, stock: 85, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
    { id: 103, name: 'Organic Cotton Tote', price: 12.99, stock: 200, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
  ],
  2: [
    { id: 201, name: 'Recycled Paper Notebook', price: 7.99, stock: 150, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
    { id: 202, name: 'Biodegradable Phone Case', price: 24.99, stock: 65, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
  ],
  3: [
    { id: 301, name: 'Solar Powered Charger', price: 49.99, stock: 30, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
    { id: 302, name: 'Compostable Cutlery Set', price: 9.99, stock: 210, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
    { id: 303, name: 'Beeswax Food Wraps', price: 15.99, stock: 75, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
  ],
  4: [
    { id: 401, name: 'Recycled Plastic Planter', price: 18.99, stock: 45, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
    { id: 402, name: 'Bamboo Cutting Board', price: 29.99, stock: 60, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
  ],
  5: [
    { id: 501, name: 'Organic Cotton Sheets', price: 89.99, stock: 25, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
    { id: 502, name: 'Wool Dryer Balls', price: 14.99, stock: 100, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
    { id: 503, name: 'Hemp Shower Curtain', price: 39.99, stock: 35, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
  ],
  6: [
    { id: 601, name: 'Recycled Glass Vase', price: 34.99, stock: 20, imageUrl: 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product' },
  ],
}

export default function VendorProducts() {
  const { vendorId } = useParams()
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Simulate API call
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const numericVendorId = parseInt(vendorId)
      setVendor(mockVendors[numericVendorId] || null)
      setProducts(mockProducts[numericVendorId] || [])
      setLoading(false)
    }, 500)
  }, [vendorId])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Vendor not found</h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/vendors" className="text-sm text-cyan-600 hover:text-cyan-800">
          ← Back to Vendors
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-800">Products by {vendor.name}</h1>
        <p className="text-gray-600">{vendor.email}</p>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        <button className="rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
          Add Product
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-4 text-center text-gray-500">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">Stock: {product.stock}</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                <Link
                  to={`/products/${product.id}`}
                  className="text-sm font-medium text-cyan-600 hover:text-cyan-800"
                >
                  Edit Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 