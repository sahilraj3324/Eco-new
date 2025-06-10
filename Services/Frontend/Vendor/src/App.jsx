import React from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import components with error handling
import VendorLogin from './Pages/Auth/Login/VendorLogin';
import VendorSignUp from './Pages/Auth/SignUp/VendorSignUp';

// Lazy load heavy components to prevent initial load errors
const VendorDashboard = React.lazy(() => import('./Pages/Vendor/Dashboard/VendorDashboard'));
const ProductDetails = React.lazy(() => import('./Pages/Vendor/Inventory/ProductDetails'));
const EditProduct = React.lazy(() => import('./Pages/Vendor/Inventory/Editproduct'));
const OrderDetails = React.lazy(() => import('./Pages/Vendor/Order/OrderDetails'));

// Simple loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/signup" element={<VendorSignUp/>} />
            <Route path="/vendorsignup" element={<VendorSignUp/>} />
            <Route path="/login" element={<VendorLogin/>} />
            
            {/* Default route - redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Protected Routes */}
            <Route 
              path="/vendordashboard" 
              element={
                <ProtectedRoute requireApproved={true}>
                  <VendorDashboard/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/product/:id" 
              element={
                <ProtectedRoute requireApproved={true}>
                  <ProductDetails/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-product/:id" 
              element={
                <ProtectedRoute requireApproved={true}>
                  <EditProduct/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendor/orders/details/:orderId" 
              element={
                <ProtectedRoute requireApproved={true}>
                  <OrderDetails />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </React.Suspense>
      </AuthProvider>
    </Router>
  )
}

export default App
