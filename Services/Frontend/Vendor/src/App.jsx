import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VendorDashboard from './Pages/Vendor/Dashboard/VendorDashboard';
import VendorSignUp from './Pages/Auth/SignUp/VendorSignUp';
import VendorLogin from './Pages/Auth/Login/VendorLogin';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Router>
      <Routes>
     
        <Route path="/vendorSignup" element={< VendorSignUp/>} />
        <Route path="/vendorlogin" element={< VendorLogin/>} />
        <Route path="/vendordashboard" element={< VendorDashboard/>} />
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
    </>
  )
}

export default App
