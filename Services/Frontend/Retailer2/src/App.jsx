import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import RetailerSignup from './Pages/Auth/SignUp/RetailerSignup';
import RetailerLogin from './Pages/Auth/Login/RetailerLogin';
import ForgotPassword from './Pages/PasswordReset/ForgotPassword';

import HomePage from './Pages/Retailers/Home/Homepage';
import ProductDetails from './Pages/Retailers/ProductDetails/Productdetails';
import Profile from './Pages/Retailers/Profile/Profile';
import CartPage from './Pages/Retailers/Cart/CartPage';
import OrderPage from './Pages/Retailers/Orders/OrderPage';
import OrderSuccessPage from './Pages/Retailers/Orders/OrderSucess';
import AllProductsPage from './Pages/Retailers/AllProduct/Allproduct';
import RetailerOrders from './Pages/Retailers/Orders/RetailersOrder';
import Navbar from './Pages/Retailers/Navbar';
import Footer from './Pages/Retailers/Footer';
import AllOrders from './Pages/Retailers/Orders/AllOrders';
import WishlistPage from './Pages/Retailers/Wishlist/wishlist';
import OrderDetails from './Pages/Retailers/Orders/OrderDetails';
import About from './Pages/Retailers/Footer/about';
import HelpSupport from './Pages/Retailers/Footer/helpSupport';
import Privacy from './Pages/Retailers/Footer/privacy';
import RefundPolicy from './Pages/Retailers/Footer/refundPolicy';
import TermsOfUse from './Pages/Retailers/Footer/terms_of_use';
import FAQ from './Pages/Retailers/Footer/faq';
import AuthDebug from './Pages/Debug/AuthDebug';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/retailerSignup" element={< RetailerSignup/>} />
          <Route path="/retailerLogin" element={< RetailerLogin/>} />
          <Route path="/forgot-password" element={< ForgotPassword/>} />
          <Route path="/" element={< HomePage/>} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/allorder" element={<AllOrders />} />
          <Route path="/ordersuccess" element={<OrderSuccessPage />} />
          <Route path="/all" element={<AllProductsPage />} />
          <Route path="/retailerOrder" element={<RetailerOrders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/debug" element={<AuthDebug />} />
          <Route path="*" element={<h2>404 Not Found</h2>} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/helpSupport" element={<HelpSupport />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refundPolicy" element={<RefundPolicy />} />
          <Route path="/terms_of_use" element={<TermsOfUse />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  )
}

export default App
