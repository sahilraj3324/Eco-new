// import { useState } from 'react'

import './App.css'
import HomePage from './Pages/Homepage/Homepage';
import ProductDetails from './Pages/Productdetails/Productdetails';
import SearchBar from './components/SearchBar';
import BottomNavBar from './components/BottomNavBar';
import MyOrders from './Pages/Orders/Orders';
import OrderPage from './Pages/Orders/OrderPage';
import OrderSuccess from './Pages/Orders/OrderSuccess';


import Settings from './Pages/Settings';
import RetailerLogin from './Pages/Auth/Login/RetailerLogin';
import Cart from './Pages/Cart/Cart';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RetailerSignup from './Pages/Auth/SignUp/RetailerSignup';
import Profile from './Pages/Profile/Profile';
import Wishlist from './Pages/Wishlist/Wishlist';
import AllOrders from './Pages/Orders/Allorders';



function App() {

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <SearchBar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/allorders" element={<AllOrders />} />
            <Route path="/orderSuccess" element={<OrderSuccess />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<RetailerLogin />} />
            <Route path="/signup" element={<RetailerSignup />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="*" element={<h2>404 Not Found</h2>} />
            <Route path="/cart" element={<Cart />} />

          </Routes>
        </div>
        <BottomNavBar />
      </div>
    </Router>
  )
}

export default App
