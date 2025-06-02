import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-72 rounded-3xl flex items-center justify-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Refund Policy 💰
            </h1>
            <p className="text-xl md:text-2xl font-light opacity-90">
              Our return and refund guidelines
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Empty State */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Refund Policy Coming Soon
          </h2>
          <p className="text-gray-600 text-lg">
            This page is ready for your refund policy and return guidelines.
          </p>
        </div>
      </section>
    </div>
  );
};

export default RefundPolicy;
