import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../../assets/logo.png";

const RetailerSignup = () => {
  const dummyGstin = "1234";
  const [gstin, setGstin] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const [information, setInformation] = useState({
    storename: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    userType: "vendor",
    gstnumber: "",
    pincode:0,
    hnscode: "",
    profile_picture:"",

  });

  const handleGstinVerify = () => {
    if (gstin.trim() === dummyGstin) {
      setVerified(true);
      setInformation({
        ...information,
        gstnumber: gstin,
        
      });
    } else {
      alert("Invalid GSTIN. Please try again.");
    }
  };

  const handleChange = (e) => {
    setInformation({ ...information, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/Buyer/signup",
        information,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data)

      setMessage("User registered successfully!");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("Id", response.data.buyer.id);
      localStorage.setItem("storename", response.data.buyer.storename);
      localStorage.setItem("email", response.data.buyer.email);
      localStorage.setItem("hnscode", response.data.buyer.hnscode);
      localStorage.setItem("phonenumber", response.data.buyer.phoneNumber);
      localStorage.setItem("pincode", response.data.buyer.pincode);
      localStorage.setItem("address", response.data.buyer.address);
      localStorage.setItem("gstnumber", response.data.buyer.gstNumber);
      localStorage.setItem("profile_picture", response.data.buyer.profile_picture);
      localStorage.setItem("userType", response.data.buyer.userType);

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to register user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <img src={logo} alt="EcoCys Logo" className="h-12 w-auto" />
            </div>
    
            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: verified ? "66%" : "33%" }}
              ></div>
            </div>
    
            {/* GSTIN Section */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700">Enter Your GSTIN</h2>
              <p className="text-sm text-gray-500 mt-1">Only Active GSTIN</p>
            </div>
    
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="07AXVPV8453E"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="flex-1 px-4 py-3 rounded-full bg-gray-100 text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              {!verified ? (
                <button
                  onClick={handleGstinVerify}
                  className="bg-cyan-500 text-white px-4 py-3 hover:bg-cyan-600 transition sm:w-auto"
                  style={{borderRadius: "9999px"}}
                >
                  Verify
                </button>
              ) : (
                <div className="flex items-center justify-center text-green-500 font-bold text-xl sm:px-4">
                  ✔️
                </div>
              )}
            </div>
    
            {/* Show form if verified */}
            {verified && (
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
    
                <input
                  type="text"
                  name="storename"
                  placeholder="StoreName"
                  value={information.storename}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 mb-2 focus:ring-cyan-400"
                  required
                />
    
                <input
                  type="number"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={information.phoneNumber}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 mb-2 focus:ring-cyan-400"
                  required
                />
    
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={information.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 mb-2 focus:ring-cyan-400"
                  required
                />
                <input
                  type="number"
                  name="pincode"
                  placeholder="Pincode"
                  value={information.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 mb-2 focus:ring-cyan-400"
                  required
                />
    
                <input
                  type="email"
                  name="email"
                  placeholder="Email@email.com"
                  value={information.email}
                  onChange={handleChange}
                  
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 mb-2 focus:ring-cyan-400"
                />
    
                <input
                  type="password"
                  name="password"
                  placeholder="***************"
                  value={information.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 mb-2 focus:ring-cyan-400"
                />
                
                <input
                  type="text"
                  name="hnscode"
                  placeholder="HnsCode"
                  value={information.hnscode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 mb-2 focus:ring-cyan-400"
                  required
                />
    
                
    
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-600 text-white font-bold py-3 hover:bg-cyan-700 transition"
                  style={{borderRadius: '9999px'}}
                >
                  {loading ? "Signing up..." : "Get Started"}
                </button>
    
                
              </form>
            )}
    
            {/* Login link */}
            <p className="text-center text-sm text-gray-500">
              Have an account?{" "}
              <Link
                to="/login"
                className="text-cyan-600 font-semibold cursor-pointer hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
  )
}

export default RetailerSignup
