import { useState } from 'react'
import './App.css'
import AuthPage from './components/Auth'
import VendorSignUp from './Pages/Auth/SignUp/VendorSignUp'
import RetailerSignup from './Pages/Auth/SignUp/RetailerSignup'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartScreen from './Pages/Auth/StartScreen'
import HomeRetailer from './Pages/Retailers/Home/HomeRetailer'
import ProductPost from './Pages/Vendor/ProductPost/ProductPost'
import LandingPage from './Pages/Landing/LandingPage'
import Section from './Pages/Retailers/Section/Section'
import Vendorhome from './Pages/Vendor/Home/VendorHome'
import VendorLogin from './Pages/Auth/Login/VendorLogin'
import VendorDashboard from './Pages/Vendor/Dashboard/VendorDashboard'
import HomePage from './Pages/Retailers/Home/Homepage'
import RetailerLogin from './Pages/Auth/Login/RetailerLogin'
import ProductDetails from './Pages/Retailers/ProductDetails/Productdetails'
import Profile from './Pages/Retailers/Profile/Profile'
import CartPage from './Pages/Retailers/Cart/CartPage'
import OrderPage from './Pages/Orders/OrderPage'
import OrderSuccessPage from './Pages/Orders/OrderSucess'
import AllProductsPage from './Pages/Retailers/AllProduct/Allproduct'
import RetailerOrders from './Pages/Retailers/Orders/RetailersOrder'

function App() {
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={< LandingPage/>} />
        <Route path="/retailerSignup" element={< RetailerSignup/>} />
        <Route path="/retailerLogin" element={< RetailerLogin/>} />
        <Route path="/startscreen" element={< StartScreen/>} />
        <Route path="/vendorSignup" element={< VendorSignUp/>} />
        <Route path="/homeRetailer" element={< Section/>} />
        <Route path="/Homepage" element={< HomePage/>} />
        <Route path="/productPost" element={< ProductPost/>} />
        <Route path="/vendorhome" element={< Vendorhome/>} />
        <Route path="/vendorlogin" element={< VendorLogin/>} />
        <Route path="/vendordashboard" element={< VendorDashboard/>} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/retailerProfile" element={<Profile />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/ordersuccess" element={<OrderSuccessPage />} />
        <Route path="/all" element={<AllProductsPage />} />
        <Route path="/retailerOrder" element={<RetailerOrders />} />
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
  )
}

export default App
