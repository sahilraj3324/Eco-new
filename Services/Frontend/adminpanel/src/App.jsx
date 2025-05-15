import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './Dashboard/Dashboard'
import Vendors from './Vendor/Vendors'
import VendorProducts from './Vendor/VendorProducts'
import Products from './Products/Products'
import Retailers from './Retailer/Retailers'
import Asks from './Asks/Asks'
import EditProduct from './Products/EditProduct'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/:vendorId/products" element={<VendorProducts />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<EditProduct />} />
        <Route path="retailers" element={<Retailers />} />
        <Route path="asks" element={<Asks />} />
      </Route>
    </Routes>
  )
}

export default App 