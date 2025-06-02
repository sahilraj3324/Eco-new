import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './Dashboard/Dashboard'
import Vendors from './Vendor/Vendors'
import VendorProducts from './Vendor/VendorProducts'
import Products from './Products/Products'
import ViewProduct from './Products/ViewProduct'
import Retailers from './Retailer/Retailers'
import Orders from './Orders/Orders'
import Asks from './Asks/Asks'
import Banners from './Banner/Banners'
import EditProduct from './Products/EditProduct'
import AddProduct from './Vendor/AddProduct'
import VendorDetails from './Vendor/VendorDetails'
import EditVendor from './Vendor/EditVendor'
import CategoryPage from './Categories/Category'
import ViewSubcategoriesPage from './Categories/ViewSubcategories'
import Admin from './Admin/Admin'
import Role from './Role/Role'
import Login from './Auth/Login'
import Signup from './Auth/Signup'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/:id" element={<VendorDetails />} />
          <Route path="vendors/:id/edit" element={<EditVendor />} />
          <Route path="vendors/:id/products" element={<VendorProducts />} />
          <Route path="vendors/:vendorId/add-product" element={<AddProduct />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ViewProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="categories/:id/subcategories" element={<ViewSubcategoriesPage />} />
          <Route path="retailers" element={<Retailers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="asks" element={<Asks />} />
          <Route path="banners" element={<Banners />} />
          <Route path="roles" element={<Role />} />
          <Route path="admins" element={<Admin />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App 