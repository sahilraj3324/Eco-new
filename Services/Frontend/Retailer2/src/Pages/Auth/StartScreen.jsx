import { Button } from 'bootstrap'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const StartScreen = () => {
  const [productid , setProductid] = useState("")

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-lg flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold text-gray-800">Choose Signup Type</h1>
        
        <div className="flex gap-6">
          <Link to="/vendorSignup">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              Vendor
            </button>
          </Link>

          <Link to="/retailerSignup">
            <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
              Retailer
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StartScreen
