import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VendorDashboard from './Pages/Vendor/Dashboard/VendorDashboard';
import VendorSignUp from './Pages/Auth/SignUp/VendorSignUp';
import VendorLogin from './Pages/Auth/Login/VendorLogin';
import ProductDetails from './Pages/Vendor/Inventory/ProductDetails';
import EditProduct from './Pages/Vendor/Inventory/Editproduct';
import OrderDetails from './Pages/Vendor/Order/OrderDetails';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Router>
      <Routes>
        <Route path="/vendorSignup" element={< VendorSignUp/>} />
        <Route path="/" element={< VendorLogin/>} />
        <Route path="/vendordashboard" element={< VendorDashboard/>} />
        <Route path="/product/:id" element={< ProductDetails/>} />
        <Route path="/edit-product/:id" element={< EditProduct/>} />
        <Route path="/vendor/orders/details/:orderId" element={<OrderDetails />} />
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
    </>
  )
}

export default App
