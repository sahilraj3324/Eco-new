import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Lock, 
  Check, 
  Users, 
  TrendingUp, 
  Headphones, 
  Shield, 
  Clock,
  ChevronDown,
  Award
} from 'lucide-react';

const BecomeSeller = () => {
  const [activeTab, setActiveTab] = useState('manufacturer');
  const [formData, setFormData] = useState({
    mobile: '',
    otp: '',
    email: '',
    password: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGetOTP = () => {
    if (formData.mobile.length === 10) {
      setCurrentStep(2);
    }
  };

  const benefits = [
    {
      icon: Users,
      title: "UNLOCK NATIONWIDE SALES",
      description: "Reach 50k Retailers Across 1,000+ Pincodes!",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: TrendingUp,
      title: "MAXIMIZE YOUR PROFITS",
      description: "Enjoy 0% Commission and Keep 100% of Your Earnings!",
      color: "from-orange-400 to-orange-600"
    },
    {
      icon: Award,
      title: "EXPERT ACCOUNT MANAGEMENT",
      description: "Dedicated team to Boost Your Ecocys Success!!",
      color: "from-green-400 to-green-600"
    },
    {
      icon: Shield,
      title: "ZERO RETURN CHARGES",
      description: "Ship Your Products Stress-Free with Our Flat, Low Rates!",
      color: "from-red-400 to-red-600"
    },
    {
      icon: Headphones,
      title: "24/7 SUPPORT",
      description: "Your Questions, Our Priority—Anytime, Anywhere!",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: Clock,
      title: "RAPID REVENUE",
      description: "Unlock Your Payments in Just 7-10 Days After Dispatch!",
      color: "from-yellow-400 to-yellow-600"
    }
  ];

  const categories = [
    "Sell Men T-Shirts", "Sell Men Trousers", "Sell Men Party Wears", "Sell Men Tuxido",
    "Sell Women Sarees", "Sell Women Salwars", "Sell Kids Party Wears", "Sell Kids Pajama",
    "Sell Men Sweatshirts", "Sell Men Shirts", "Sell Men Formals", "Sell Men Pants",
    "Sell Women Suits", "Sell Women Uppers", "Sell Kids Nightwears", "Sell Kids Clothes"
  ];

  const faqs = [
    {
      question: "How To Add Products On EcoCys?",
      answer: "Go to, apply to add products on dashboard, select how you want to upload and follow our easy process. Also Click Here to get started!"
    },
    { 
      question: "How To Manage Addresses?", 
      answer: "You can manage your pickup and return addresses in the 'My Addresses' section of your seller dashboard." 
    },
    { 
      question: "Change My Profile Information", 
      answer: "Profile information can be updated in the 'Account Settings' section of your seller dashboard." 
    },
    { 
      question: "Add Bulk Products", 
      answer: "Use our Excel template to upload multiple products at once through the 'Bulk Upload' feature in your dashboard." 
    },
    { 
      question: "How To Withdraw Funds?", 
      answer: "Funds can be withdrawn to your registered bank account from the 'Payments' section once they are settled." 
    },
    { 
      question: "What Is Commission Rate?", 
      answer: "EcoCys charges 0% commission on all sales - you keep 100% of your earnings!" 
    },
    { 
      question: "What Is Payment Settlement Cycle?", 
      answer: "Payments are settled within 7-10 days after order dispatch to the buyer." 
    },
    { 
      question: "How Product Order Works?", 
      answer: "Buyers place orders through our platform, you receive notifications, pack and ship the products, and get paid after delivery." 
    },
    { 
      question: "Can I Change My GST?", 
      answer: "Yes, you can update your GST details in the 'Business Information' section of your seller account." 
    },
    { 
      question: "Why EcoCys For Wholesalers, Retailer & Manufacturers?", 
      answer: "EcoCys provides the largest B2B marketplace with 0% commission, dedicated support, and nationwide reach." 
    },
    { 
      question: "Who Manages Logistics?", 
      answer: "You can choose to manage your own logistics or use our partnered logistics providers for seamless shipping." 
    },
    { 
      question: "Whats The Rate Of Logistics?", 
      answer: "Logistics rates are based on weight and distance, with special discounted rates for our sellers." 
    },
    { 
      question: "Who Pays For Logistics?", 
      answer: "You can choose to pay for logistics or have the buyer pay - this can be configured in your shipping settings." 
    },
    { 
      question: "How To Remove Products?", 
      answer: "Products can be deactivated or deleted from the 'Product Management' section of your dashboard." 
    },
    { 
      question: "How To Change Payment Methods?", 
      answer: "Payment methods can be updated in the 'Payment Settings' section of your account." 
    },
    { 
      question: "Can I Enter Multiple Pickup Locations?", 
      answer: "Yes, you can add and manage multiple warehouse/pickup locations in your account settings." 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                Reach thousands of Buyers online with{' '}
                <span className="text-teal-600">0% commission</span> on sales.
              </h1>
              <p className="text-gray-600 mb-8 text-lg">Start Your B2B Selling With EcoCys</p>

              {/* Login & Signup Buttons */}
              <div className="space-y-4 max-w-md">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-teal-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Join EcoCys Today!</h3>
                  <p className="text-gray-600 text-center mb-6">Choose an option to get started with your seller journey</p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.location.href = '/retailersignup'}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span>🚀</span>
                      <span>Create Seller Account</span>
                    </button>
                    
                    <button 
                      onClick={() => window.location.href = '/retailerlogin'}
                      className="w-full bg-white hover:bg-gray-50 text-teal-600 border-2 border-teal-500 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span>👤</span>
                      <span>Login to Dashboard</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">Already have an account? Use Login. New to EcoCys? Sign Up!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Seller Success"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('manufacturer')}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'manufacturer'
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                Manufacturer
              </button>
              <button
                onClick={() => setActiveTab('retailers')}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'retailers'
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                Retailers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group p-6 hover:bg-gray-50 rounded-xl transition-colors">
                <div className={`w-20 h-20 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wider">{benefit.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Popular Categories To Sell Online</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="bg-white p-3 rounded-lg text-center hover:shadow-md transition-shadow cursor-pointer hover:border-teal-400 border border-transparent">
                <p className="text-xs text-gray-700 font-medium">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplier Support */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Ecocys Supplier Support Available 24X7
              </h2>
              <p className="text-gray-600 mb-8">
                Ecocys Supplier Support Available 24X7 For Your Queries, Questions & Onboarding Support. Let's get Started With Selling Online With Ecocys Today!
              </p>
              <div className="flex items-center bg-teal-50 p-4 rounded-lg max-w-md">
                <Mail className="text-teal-500 mr-3 flex-shrink-0" size={24} />
                <div>
                  <p className="text-sm text-gray-600">You Can Reach Out To</p>
                  <p className="font-semibold text-gray-800">Management@Ecocys.com</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-block p-8 bg-teal-50 rounded-2xl">
                <Headphones className="text-teal-500 mx-auto" size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 lg:p-16 text-white overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Become A Seller On EcoCys
                </h2>
                <p className="text-xl mb-8 opacity-90">Create Your Seller Account Today!</p>
                
                <div className="space-y-4 mb-8">
                  {[
                    "Create Account As Wholeseller Or Manufacturer",
                    "Add Multiple Products",
                    "Accept Orders & Get Paid",
                    "Zero Penalty Fees",
                    "Easy Tracking & Logistics"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="text-white" size={16} />
                      </div>
                      <span className="text-lg">{item}</span>
                    </div>
                  ))}
                </div>

                <button className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors">
                  Get Started
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="Warehouse" 
                  className="rounded-2xl object-cover h-full" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1600166898405-da9535204843?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="Delivery" 
                  className="rounded-2xl object-cover h-full" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Logistics" 
                  className="rounded-2xl col-span-2 object-cover h-48 w-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  <ChevronDown
                    className={`text-gray-400 transition-transform ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                    size={20}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeSeller;