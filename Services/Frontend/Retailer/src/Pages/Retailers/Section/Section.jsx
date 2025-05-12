import { useState } from "react";
import HomeRetailer from "../Home/HomeRetailer";


const Section = () => {
    const [activePage, setActivePage] = useState("home");

    const renderContent = () => {
      switch (activePage) {
        case "home":
          return <div className="p-6 text-gray-900" ><HomeRetailer/></div>;
        case "about":
          return <div className="p-6 text-gray-900">About Us: Learn more about our journey.</div>;
        case "services":
          return <div className="p-6 text-gray-900">Our Services: What we offer.</div>;
        case "contact":
          return <div className="p-6 text-gray-900">Contact Us: Get in touch.</div>;
        default:
          return <div className="p-6 text-gray-900">Welcome to the Home Page</div>;
      }
    };
  
    return (
      <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Sidebar */}
        <aside className="w-1/4 bg-gray-200 dark:bg-gray-800 p-6 min-h-screen">
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <ul>
            <li><button variant="ghost" onClick={() => setActivePage("home")}>Home</button></li>
            <li><button variant="ghost" onClick={() => setActivePage("about")}>About</button></li>
            <li><button variant="ghost" onClick={() => setActivePage("services")}>Services</button></li>
            <li><button variant="ghost" onClick={() => setActivePage("contact")}>Contact</button></li>
          </ul>
        </aside>
        
        {/* Content Area */}
        <main className="w-3/4 bg-white dark:bg-gray-700 p-6">
          {renderContent()}
        </main>
      </div>
    );
}

export default Section
