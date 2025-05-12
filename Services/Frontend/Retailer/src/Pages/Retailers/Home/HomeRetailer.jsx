import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios'
const HomeRetailer = () => {
    const [contents, setContents] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/api/Product/get-all");
        setContents(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-10 items-center">
    {contents.length > 0 ? (
      contents.map((content, index) => (
        <div key={content._id || index} className="flex justify-center items-center">
          <div className="relative w-64 h-40 cursor-pointer ">
            <span className="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-indigo-500 rounded-lg"></span>
            <div className="relative p-6 w-full h-full bg-white border-2 border-indigo-500 rounded-lg hover:scale-105 transition duration-500 flex flex-col justify-center">
              <div className="flex items-center">
                <span className="text-2xl">😎</span>
                <h3 className="ml-3 text-lg font-bold text-gray-800">{content.name}</h3>
              </div>
              <p className="text-gray-600 text-sm mt-2">{content.description}</p>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500">Loading content...</p>
    )}
  </div>
  )
}

export default HomeRetailer
