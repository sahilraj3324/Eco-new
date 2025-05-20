// import { useState } from 'react'

import './App.css'
import HomePage from './Pages/Homepage/Homepage';
import ProductDetails from './Pages/Productdetails/Productdetails';
import SearchBar from './components/SearchBar';
import BottomNavBar from './components/BottomNavBar';
import MyOrders from './Pages/Orders/Orders';
import Profile from './Pages/Profile';
import Settings from './Pages/Settings';
import RetailerLogin from './Pages/Auth/Login/RetailerLogin';


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RetailerSignup from './Pages/Auth/SignUp/RetailerSignup';


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
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<RetailerLogin />} />
            <Route path="/signup" element={<RetailerSignup />} />
            <Route path="*" element={<h2>404 Not Found</h2>} />
            <Route path="/login" element={<RetailerLogin />} />
          </Routes>
        </div>
        <BottomNavBar />
      </div>
    </Router>
  )
}

export default App
