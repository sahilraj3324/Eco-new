// import { useState } from 'react'

import './App.css'
import HomePage from './Pages/Homepage/Homepage';
import ProductDetails from './Pages/Productdetails/Productdetails';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {

  return (
   <Router>
    <Routes>
      <Route path="/" element={< HomePage />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="*" element={<h2>404 Not Found</h2>} />
    </Routes>
  </Router>
  )
}

export default App
