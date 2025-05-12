import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios'

const AuthPage = () => {
  async function responce() {
    const res = await axios.get("/api/Seller/get-all")
    console.log(res.data)
  }

  
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 ">
      <div className="text-center">
        <img
          src="https://via.placeholder.com/100"
          alt="Logo"
          className="mb-4"
        />
        <h2 className="mb-3">Login</h2>
        <form>
          <div className="mb-3">
            <input
              type="tel"
              className="form-control border-0 border-bottom rounded-10 text-center"
              placeholder="Phone Number"
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control border-0 border-bottom rounded-10 text-center"
              placeholder="Password"
            />
          </div>
          <button className="btn btn-primary w-100 mb-2">Continue</button>
          <button className="btn btn-secondary w-100">Sign Up</button>
        </form>
      </div>
      <button onClick={responce}>click me</button>
    </div>
  );
};

export default AuthPage;