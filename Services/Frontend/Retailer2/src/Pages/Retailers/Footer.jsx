import React from "react";
import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Explore",
    links: [
      { label: "Top Products", path: "/top-products" },
      { label: "Trending Products", path: "/trending-products" },
      { label: "New Products", path: "/new-products" },
      { label: "Find Vendors", path: "/vendors" },
      { label: "Post Requirements", path: "/post-requirements" },
      { label: "View All", path: "/products" },
    ],
  },
  {
    title: "Seller",
    links: [
      { label: "Become A Seller", path: "/seller/signup" },
      { label: "Add Products", path: "/seller/add-product" },
      { label: "Manage Products", path: "/seller/products" },
      { label: "My Profile", path: "/seller/profile" },
      { label: "Orders", path: "/seller/orders" },
      { label: "Payments", path: "/seller/payments" },
      { label: "Dashboard", path: "/seller/dashboard" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Help & Support", path: "/support" },
      { label: "About Ecocys", path: "/about" },
      { label: "FAQs", path: "/faq" },
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Refund Policy", path: "/refund-policy" },
      { label: "Terms Of Use", path: "/terms" },
    ],
  },
  {
    title: "User",
    links: [
      { label: "My Cart", path: "/cart" },
      { label: "My Wishlist", path: "/wishlist" },
      { label: "My Account", path: "/account" },
      { label: "Help & Support", path: "/support" },
    ],
  },
  {
    title: "Social",
    links: [
      {
        label: "Instagram",
        external: true,
        path: "https://instagram.com/yourprofile",
      },
      {
        label: "Facebook",
        external: true,
        path: "https://facebook.com/yourprofile",
      },
      {
        label: "YouTube",
        external: true,
        path: "https://youtube.com/yourchannel",
      },
      {
        label: "Twitter",
        external: true,
        path: "https://twitter.com/yourprofile",
      },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-200 py-10 mt-10 w-full">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-10 text-sm text-gray-600">
      {footerSections.map((section, index) => (
        <div key={index}>
          <h4 className="mb-3 font-bold text-gray-200">{section.title}</h4>
          <ul className="space-y-2">
            {section.links.map((link, i) =>
              link.external ? (
                <li key={i}>
                  <a
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-600 text-gray-200 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ) : (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="hover:text-purple-600 text-gray-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      ))}
  
      {/* Address column */}
      <div className="md:col-span-1 sm:col-span-3 col-span-2">
        <h4 className="mb-3 font-bold text-gray-200">Contact</h4>
        <address className="not-italic space-y-1 text-sm text-gray-200">
          <p>EcoCys Pvt. Ltd.</p>
          <p>123 Green Street</p>
          <p>Bangalore, Karnataka 560001</p>
          <p>India</p>
          <p>Email: contact@ecocys.com</p>
        </address>
      </div>
    </div>
  
    <p className="text-center text-xs text-gray-400 mt-6">
      © 2025 EcoCys. All Rights Reserved.
    </p>
  </footer>
  

  );
};

export default Footer;
