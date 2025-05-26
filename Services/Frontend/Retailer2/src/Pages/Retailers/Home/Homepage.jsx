import React, { useState } from 'react';
import logo from "../../../assets/logo.png";
import TopProduct from './TopProducts';
import NewProducts from './Newproduct';
import TrendingProducts from './TrendingProducts';
import NewProduct2 from './NewProduct2';
import sellerImg from './image.png';
import { Link } from 'react-router-dom';

// Simple ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // Log error if needed
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 text-center">Something went wrong loading this section.</div>;
    }
    return this.props.children;
  }
}

const HomePage = () => {
  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-purple-200 to-purple-300 h-60 rounded-2xl m-4 flex items-center justify-center text-3xl font-semibold text-purple-800">
        Discover What Moves the Market 🚀
      </section>

      {/* Product Sections */}
      <div className="max-w-7xl mx-auto px-4">
        <ErrorBoundary>
          <TopProduct />
        </ErrorBoundary>
        <ErrorBoundary>
          <NewProducts />
        </ErrorBoundary>
        <ErrorBoundary>
          <TrendingProducts />
        </ErrorBoundary>
        <ErrorBoundary>
          <NewProduct2 />
        </ErrorBoundary>
      </div>

      {/* Become A Seller Section */}
      <section className="my-10 px-4 flex justify-center">
        <img
          src={sellerImg}
          alt="Become a Seller - Join our platform to reach more customers"
          className="rounded-3xl w-full max-w-4xl object-cover shadow-xl"
        />
      </section>

    </div>
  );
};

export default HomePage;
