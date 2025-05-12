import React from "react";

const tutorials = [
  {
    title: "Add Single Product On EcoCys",
    duration: "7 Mins",
    videoUrl: "https://www.example.com/single-product", // Replace with actual link
  },
  {
    title: "Add Multiple Products On EcoCys",
    duration: "14 Mins",
    videoUrl: "https://www.example.com/multiple-products", // Replace with actual link
  },
];

const SellerHome = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800">
          Your Profile Is Approved For Selling On EcoCys.
        </h2>
        <p className="text-gray-600 mt-2">
          Use Upper Tabs To Navigate & Start Doing Business On Ecosys!
        </p>
        <p className="text-gray-500 mt-2">
          Feel free to contact support in case you feel confused or stuck. You can also
          watch our tutorials & FAQs mentioned below to get started with step-by-step guidance.
        </p>

        <h3 className="text-xl font-bold text-gray-700 mt-6">Video Tutorials</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="bg-black text-white p-4 rounded-lg flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold">{tutorial.title}</h4>
                <p className="text-gray-300">{tutorial.duration}</p>
              </div>
              <button
                onClick={() => window.open(tutorial.videoUrl, "_blank")}
                className="mt-4 w-12 h-12 bg-yellow-500 flex items-center justify-center rounded-full self-start"
              >
                ▶
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerHome;
