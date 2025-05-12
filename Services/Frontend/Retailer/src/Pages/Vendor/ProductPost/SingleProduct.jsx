import React, { useState, useEffect } from "react";
import axios from "axios";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../Firebase/firebase";

const SingleProduct = () => {
  const [sellerid, setSellerid] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [information, setInformation] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    sellerId: "",
    category: "",
    subcategory: "",
    gst: "5%",
    hsn1: "",
    size: "",
    color: "",
    weight: "",
    moq: "",
    piecesPerPack: "",
    material: "",
    fitShape: "",
    neckType: "",
    occasion: "",
    pattern: "",
    sleeveLength: "",
    shipsIn: "",
    brand: "",
    imageUrls: [],
    mainImage: "",
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem("Id");
    if (storedUserId) {
      setSellerid(storedUserId);
      setInformation((prev) => ({ ...prev, sellerId: storedUserId }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedImages(files); // store actual File objects
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    setMainImageFile(file);
  };

  const uploadToFirebase = (file, path) => {
    return new Promise((resolve, reject) => {
      const imageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(imageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!information.name ) {
      setMessage("Please fill all required fields (name)");
      setLoading(false);
      return;
    }

    try {
      // Upload all images to Firebase
      const imageUrls = await Promise.all(
        uploadedImages.map((file) => uploadToFirebase(file, "products"))
      );

      const mainImageUrl = mainImageFile
        ? await uploadToFirebase(mainImageFile, "products")
        : "";

      const payload = {
        ...information,
        price: parseFloat(information.price),
        stock: parseInt(information.stock),
        imageUrls,
        mainImage: mainImageUrl,
      };

      await axios.post("/api/Product/add", JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });

      setMessage("✅ Product added successfully!");
      setUploadedImages([]);
      setMainImageFile(null);
      setMainImage(null);
      setInformation((prev) => ({
        ...prev,
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        subcategory: "",
        gst: "5%",
        hsn1: "",
        size: "",
        color: "",
        weight: "",
        moq: "",
        piecesPerPack: "",
        material: "",
        fitShape: "",
        neckType: "",
        occasion: "",
        pattern: "",
        sleeveLength: "",
        shipsIn: "",
        brand: "",
        imageUrls: [],
        mainImage: "",
      }));
    } catch (error) {
      setMessage("❌ Failed to add product. Please try again.");
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-start mb-5 text-gray-500">
              Add Single Product To Your Catalogue
            </h2>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <select
                name="category"
                value={information.category}
                onChange={handleChange}
                className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              >
                <option value="">Select Category</option>
                <option>Clothing</option>
                <option>Footwear</option>
              </select>

              <select
                name="subcategory"
                value={information.subcategory}
                onChange={handleChange}
                className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              >
                <option value="">Select Subcategory</option>
                <option>T-Shirts</option>
                <option>Sandals</option>
              </select>
            </div>

            {/* GST & HSN */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-xl font-semibold mb-4">
                Product Size & Inventory
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <select
                  name="gst"
                  value={information.gst}
                  onChange={handleChange}
                  className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                >
                  <option value="">Select GST Rate</option>
                  <option value="5%">5%</option>
                  <option value="12%">12%</option>
                </select>

                <select
                  name="hsn1"
                  value={information.hsn1}
                  onChange={handleChange}
                  className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                >
                  <option value="">Select HSN Code</option>
                  <option value="6109">6109 - T-shirts</option>
                  <option value="6204">6204 - Women’s Garments</option>
                  <option value="6110">6110 - Sweaters</option>
                  <option value="6403">6403 - Footwear</option>
                </select>
              </div>
            </div>

            {/* Sizes */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-xl font-semibold mb-4">Select Sizes</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {["S", "M", "L", "XL", "XXL"].map((s) => (
                  <label key={s} className="flex items-center">
                    <input
                      type="radio"
                      name="size"
                      value={s}
                      checked={information.size === s}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-xl font-semibold mb-4">Select Colors</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {["Red", "Blue", "Green", "Black"].map((c) => (
                  <label key={c} className="flex items-center">
                    <input
                      type="radio"
                      name="color"
                      value={c}
                      checked={information.color === c}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  placeholder="Product Name"
                  name="name"
                  value={information.name}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  placeholder="Enter Weight In Kilos"
                  name="weight"
                  value={information.weight}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  placeholder="MOQ (In Packs)"
                  name="moq"
                  value={information.moq}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  placeholder="Pieces In 1 Pack"
                  name="piecesPerPack"
                  value={information.piecesPerPack}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  placeholder="Fabric"
                  name="material"
                  value={information.material}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  placeholder="Fit Shape"
                  name="fitShape"
                  value={information.fitShape}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-4">
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  name="neckType"
                  value={information.neckType}
                  onChange={handleChange}
                >
                  <option value="">Select Neck Type</option>
                  <option>Round Neck</option>
                  <option>V-Neck</option>
                  <option>Collar</option>
                  <option>Boat Neck</option>
                </select>

                <select
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  name="occasion"
                  value={information.occasion}
                  onChange={handleChange}
                >
                  <option value="">Select Occasion</option>
                  <option>Casual</option>
                  <option>Formal</option>
                  <option>Party</option>
                  <option>Festive</option>
                </select>

                <select
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  name="pattern"
                  value={information.pattern}
                  onChange={handleChange}
                >
                  <option value="">Select Pattern</option>
                  <option>Solid</option>
                  <option>Striped</option>
                  <option>Printed</option>
                  <option>Checked</option>
                </select>

                <select
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  name="sleeveLength"
                  value={information.sleeveLength}
                  onChange={handleChange}
                >
                  <option value="">Select Sleeve Length</option>
                  <option>Sleeveless</option>
                  <option>Short Sleeve</option>
                  <option>Half Sleeve</option>
                  <option>Full Sleeve</option>
                </select>

                <select
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  name="shipsIn"
                  value={information.shipsIn}
                  onChange={handleChange}
                >
                  <option value="">Ships In (Days)</option>
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="4">4 Days</option>
                </select>

                <select
                  className="p-3 rounded-lg bg-gray-100 w-full border"
                  name="brand"
                  value={information.brand}
                  onChange={handleChange}
                >
                  <option value="">Select Brand</option>
                  <option>Brand A</option>
                  <option>Brand B</option>
                  <option>Brand C</option>
                </select>
              </div>
            </div>

            {/* Main Image Upload */}
            <div className="mb-6">
              <label className="block text-gray-600 mb-2">Main Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="w-full p-3 rounded-lg bg-gray-100"
              />
              {mainImageFile && (
                <img
                  src={URL.createObjectURL(mainImageFile)} // Preview the main image before uploading
                  alt="Main"
                  className="w-32 h-40 object-cover rounded mx-auto mb-4"
                />
              )}
            </div>

            {/* Additional Images Upload */}
            <div className="mb-6">
              <label className="block text-gray-600 mb-2">Additional Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full p-3 rounded-lg bg-gray-100"
              />
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {uploadedImages.map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)} // Preview the file before uploading
                    alt={`Uploaded ${i}`}
                    className="w-20 h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>

            {/* Message */}
            {message && <p className="text-center text-xl font-bold mb-6">{message}</p>}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-500 text-white p-3 rounded shadow-md hover:bg-blue-700 transition-all duration-300"
              >
                {loading ? "Submitting..." : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SingleProduct;
