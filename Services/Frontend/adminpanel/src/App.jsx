import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Vendors from './pages/Vendors'
import VendorProducts from './pages/VendorProducts'
import Products from './pages/Products'
import ProductEdit from './pages/ProductEdit'
import Retailers from './pages/Retailers'
import Asks from './pages/Asks'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/:vendorId" element={<VendorProducts />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:productId" element={<ProductEdit />} />
        <Route path="retailers" element={<Retailers />} />
        <Route path="asks" element={<Asks />} />
      </Route>
    </Routes>
  )
}

export default App 