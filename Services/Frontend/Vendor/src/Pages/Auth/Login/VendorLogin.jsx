import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png'; // Adjust the path based on your folder structure

const VendorLogin = () => {
  const [information, setInformation] = useState({
    Email: "",
    Password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { fetchCurrentUser } = useAuthContext();

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
          withCredentials: true, // Enable cookies
        }
      );
      
      console.log('Login response:', response.data);

      // Clear inputs
      setInformation({ Email: "", Password: "" });

      // Wait a moment for cookie to be set, then refresh auth state
      setTimeout(async () => {
        try {
          // Refresh the auth context to get user data
          const userData = await fetchCurrentUser();
          
          if (userData && userData.status === "Approved") {
            navigate("/vendordashboard");
          } else if (userData && userData.status !== "Approved") {
            setError("Your account is pending approval. Please wait for admin approval.");
          } else {
            setError("Failed to get user data after login. Please try again.");
          }
        } catch (authError) {
          console.error('Auth error after login:', authError);
          setError("Authentication failed after login. Please try logging in again.");
        }
      }, 500); // 500ms delay to ensure cookie is set

    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please make sure the backend is running on port 5000.");
      } else {
        setError(error.response?.data?.message || "Login failed. Please try again.");
      }
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
            name="Email"
            placeholder="Enter your email"
            value={information.Email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full mb-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            autoComplete="email"
            required
          />

          <input
            type="password"
            name="Password"
            placeholder="Enter your password"
            value={information.Password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full mb-5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            autoComplete="current-password"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-cyan-600 text-sm font-medium">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white font-bold py-3 rounded-full hover:bg-cyan-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup or Support Link */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/vendorsignup" className="text-cyan-600 font-semibold cursor-pointer hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VendorLogin;
