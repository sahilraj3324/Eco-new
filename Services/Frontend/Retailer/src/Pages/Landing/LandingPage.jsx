import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  
  return (
    <div className="min-h-screen  text-gray-900  ">
    {/* Hero Section */}
    <section className="flex flex-col md:flex-row items-center  h-screen   px-6">
      <div className="md:w-1/2 p-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Reach thousands of Buyers online with 0% commission on sales.</h1>
        <p className="text-lg text-gray-600  mb-6">
         Start Your B2B Selling With EcoCys
        </p>
        <button className="px-6 py-3 text-lg">Get Started</button>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <img src="/hero-image.png" alt="Hero Image" className="max-w-md rounded-lg shadow-lg" />
      </div>
    </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-200 dark:bg-gray-700 rounded-xl">
              <h3 className="text-xl font-semibold">Fast Performance</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Experience blazing-fast speed with our optimized platform.
              </p>
            </div>
            <div className="p-6 bg-gray-200 dark:bg-gray-700 rounded-xl">
              <h3 className="text-xl font-semibold">Secure & Reliable</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Your data is protected with top-tier security measures.
              </p>
            </div>
            <div className="p-6 bg-gray-200 dark:bg-gray-700 rounded-xl">
              <h3 className="text-xl font-semibold">User-Friendly</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Our intuitive interface makes navigation a breeze.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call-to-Action */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg mb-6">Join us today and take your projects to the next level.</p>
        <Link to="/startscreen">
        <button className="px-6 py-3 bg-white text-blue-600 font-bold">Sign Up Now</button>
        </Link>
        
      </section>
      
      {/* Footer */}
      <footer className="py-6 text-center bg-gray-800 text-white">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage
