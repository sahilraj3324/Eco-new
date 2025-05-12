import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png'; // Adjust the path based on your folder structure

const VendorLogin = () => {
  const [information, setInformation] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInformation({ ...information, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/Seller/login",
        information,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("User logged in successfully!");

      // Save data to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("Id", response.data.seller.id);
      localStorage.setItem("storename", response.data.seller.storename);
      localStorage.setItem("email", response.data.seller.email);
      localStorage.setItem("hnscode", response.data.seller.hnscode);
      localStorage.setItem("phonenumber", response.data.seller.phoneNumber);
      localStorage.setItem("pincode", response.data.seller.pincode);
      localStorage.setItem("address", response.data.seller.address);
      localStorage.setItem("gstnumber", response.data.seller.gstNumber);
      localStorage.setItem("profile_picture", response.data.seller.profile_picture);
      localStorage.setItem("userType", response.data.seller.userType);

      // Clear inputs
      setInformation({ email: "", password: "" });

      // Navigate to vendor dashboard
      navigate("/vendordashboard");

    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logo} alt="EcoCys Logo" className="h-16 w-auto" />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div className="h-full w-full bg-cyan-500 rounded-full transition-all duration-300"></div>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={information.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full mb-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={information.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full mb-5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-cyan-600 text-sm font-medium">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white font-bold py-3 rounded hover:bg-cyan-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup or Support Link */}
        <p className="text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <span className="text-cyan-600 font-semibold cursor-pointer hover:underline">
            Contact support
          </span>
        </p>
      </div>
    </div>
  );
};

export default VendorLogin;
