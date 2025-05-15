import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RetailerSignup from './Pages/Auth/SignUp/RetailerSignup';
import RetailerLogin from './Pages/Auth/Login/RetailerLogin';

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
import Allorder from './Pages/Retailers/Orders/AllOrders';
import WishlistPage from './Pages/Retailers/Wishlist/wishlist';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Navbar />
    <Routes>
      <Route path="/retailerSignup" element={< RetailerSignup/>} />
      <Route path="/retailerLogin" element={< RetailerLogin/>} />
      <Route path="/" element={< HomePage/>} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/allorder" element={<Allorder />} />
      <Route path="/ordersuccess" element={<OrderSuccessPage />} />
      <Route path="/all" element={<AllProductsPage />} />
      <Route path="/retailerOrder" element={<RetailerOrders />} />
      <Route path="*" element={<h2>404 Not Found</h2>} />
      <Route path="/wishlist" element={<WishlistPage />} />

    </Routes>
    <Footer />
  </Router>
  )
}

export default App
