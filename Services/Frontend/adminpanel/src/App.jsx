import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './Dashboard/Dashboard'
import Vendors from './Vendor/Vendors'
import VendorProducts from './Vendor/VendorProducts'
import Products from './Products/Products'
import ViewProduct from './Products/ViewProduct'
import Retailers from './Retailer/Retailers'
import Asks from './Asks/Asks'
import EditProduct from './Products/EditProduct'
import AddProduct from './Vendor/AddProduct'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import VendorDetails from './Vendor/VendorDetails'
import EditVendor from './Vendor/EditVendor'
import CategoryPage from './Categories/Category'
import ViewSubcategoriesPage from './Categories/ViewSubcategories'
import Admin from './Admin/Admin'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Vendor Routes - order matters: specific routes first */}
        <Route path="vendors/edit/:id" element={<EditVendor />} />
        <Route path="vendors/add/:vendorId" element={<AddProduct />} />
        <Route path="vendors/:vendorId/products" element={<VendorProducts />} />
        <Route path="vendors/:id" element={<VendorDetails />} />
        <Route path="vendors" element={<Vendors />} />
        
        {/* Product Routes - order matters: specific routes first */}
        <Route path="products/add/:vendorId" element={<AddProduct />} />
        <Route path="products/view/:id" element={<ViewProduct />} />
        <Route path="products/:id" element={<EditProduct />} />
        <Route path="products" element={<Products />} />
        
        {/* Retailer Routes */}
        <Route path="retailers" element={<Retailers />} />
        
        {/* Category Routes */}
        <Route path="categories/:categoryId/subcategories" element={<ViewSubcategoriesPage />} />
        <Route path="categories" element={<CategoryPage />} />
        
        {/* Ask Routes */}
        <Route path="asks" element={<Asks />} />
        
        {/* Admin Routes */}
        <Route path="admins" element={<Admin />} />
      </Route>
    </Routes>
  )
}

export default App 