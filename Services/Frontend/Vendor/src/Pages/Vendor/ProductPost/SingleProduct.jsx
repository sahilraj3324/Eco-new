import { useState, useEffect } from "react";
import axios from "axios";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../Firebase/firebase";

const SingleProduct = () => {
  const [sellerId, setSellerId] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [information, setInformation] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    subcategory: "",
    gst: "5%",
    hsn1: "",
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
    sizes: [],
    colors: [],
    weights: {},
  });

  useEffect(() => {
    const storedId = localStorage.getItem("Id");
    if (storedId) {
      setSellerId(storedId);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInformation((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    setUploadedImages(Array.from(e.target.files));
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

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setInformation((prev) => {
      const updatedArray = checked
        ? [...prev[name], value]
        : prev[name].filter((item) => item !== value);
      return { ...prev, [name]: updatedArray };
    });
  };

  const handleSizeChange = (e) => {
    const { value, checked } = e.target;
    setInformation((prev) => {
      let updatedSizes = checked
        ? [...prev.sizes, value]
        : prev.sizes.filter((s) => s !== value);

      let updatedWeights = { ...prev.weights };
      if (checked) {
        updatedWeights[value] = "";
      } else {
        delete updatedWeights[value];
      }

      return {
        ...prev,
        sizes: updatedSizes,
        weights: updatedWeights,
      };
    });
  };

  const handleWeightChange = (size, value) => {
    setInformation((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [size]: value,
      },
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    if (
      !information.name ||
      !information.price ||
      !information.stock ||
      !sellerId
    ) {
      setMessage("❌ Please fill all required fields.");
      setLoading(false);
      return;
    }
  
    try {
      // Upload images
      const imageUrls = await Promise.all(
        uploadedImages.map((file) => uploadToFirebase(file, "products"))
      );
  
      const mainImageUrl = mainImageFile
        ? await uploadToFirebase(mainImageFile, "products")
        : "";
  
      // 🔁 Prepare Variants
      const variants = [];
      for (const size of information.sizes) {
        for (const color of information.colors) {
          variants.push({
            Size: size,  // Ensure Size is a string
            Color: color, // Ensure Color is a string
            Weight: information.weights[size] || "", // Ensure Weight is a string
          });
        }
      }
  
      const product = {
        name: information.name,
        description: information.description,
        price: parseFloat(information.price),
        stock: parseInt(information.stock),
        sellerId: sellerId,
        category: information.category,
        subcategory: information.subcategory,
        gst: information.gst,
        hsn1: information.hsn1,
        moq: information.moq,
        piecesPerPack: information.piecesPerPack,
        material: information.material,
        fitShape: information.fitShape,
        neckType: information.neckType,
        occasion: information.occasion,
        pattern: information.pattern,
        sleeveLength: information.sleeveLength,
        shipsIn: information.shipsIn,
        brand: information.brand,
        mainImage: mainImageUrl,
        imageUrls: imageUrls,
        imageUrlsJson: JSON.stringify(imageUrls),
        variants: variants,  // Make sure variants is an array of objects
        variantsJson: JSON.stringify(variants), // Correctly stringify variants
        status: "In Review", // You can adjust or remove if backend overrides it
      };
  
      const response = await axios.post("/api/Product/add", product, {
        headers: { "Content-Type": "application/json" },
      });
  
      setMessage("✅ Product added successfully!");
      setInformation({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        subcategory: "",
        gst: "5%",
        hsn1: "",
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
        sizes: [],
        colors: [],
        weights: {},
      });
      setUploadedImages([]);
      setMainImageFile(null);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setMessage(`❌ Upload failed: ${err.response?.data?.message || "Unknown error"}`);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <select
                name="gst"
                value={information.gst}
                onChange={handleChange}
                className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              >
                <option value="">Select GST</option>
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

            {/* Sizes & Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Select Size</h3>
                <div className="flex gap-4">
                <div>
  <h3 className="font-bold mb-1">Select Sizes</h3>
  <div className="flex gap-4">
    {["S", "M", "L", "XL", "XXL"].map((size) => (
      <label key={size} className="flex items-center">
        <input
          type="checkbox"
          value={size}
          checked={information.sizes.includes(size)}
          onChange={handleSizeChange}
          className="mr-2"
        />
        {size}
      </label>
    ))}
  </div>

  {information.sizes.length > 0 && (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Enter Weight for Selected Sizes</h4>
      {information.sizes.map((size) => (
        <div key={size} className="mb-2">
          <label className="block mb-1">{size} Weight (kg):</label>
          <input
            type="text"
            value={information.weights[size] || ""}
            onChange={(e) => handleWeightChange(size, e.target.value)}
            className="p-2 border rounded w-full"
            placeholder={`Enter weight for size ${size}`}
          />
        </div>
      ))}
    </div>
  )}
</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Select Color</h3>
                <div className="flex gap-4">
                {["Red", "Blue", "Green", "Black"].map((c) => (
  <label key={c} className="flex items-center">
    <input
      type="checkbox"
      name="colors"
      value={c}
      checked={information.colors.includes(c)}
      onChange={handleCheckboxChange}
      className="mr-2"
    />
    {c}
  </label>
))}
                </div>
              </div>
            </div>

            {/* Other Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full "
                  name="name"
                  placeholder="Product Name"
                  value={information.name}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full "
                  name="weight"
                  placeholder="Weight (kg)"
                  value={information.weight}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full "
                  name="moq"
                  placeholder="MOQ (packs)"
                  value={information.moq}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full "
                  name="piecesPerPack"
                  placeholder="Pieces per Pack"
                  value={information.piecesPerPack}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full "
                  name="material"
                  placeholder="Fabric Material"
                  value={information.material}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full "
                  name="fitShape"
                  placeholder="Fit Shape"
                  value={information.fitShape}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-4">
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full "
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
                  className="p-3 rounded-lg bg-gray-100 w-full "
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
                  className="p-3 rounded-lg bg-gray-100 w-full "
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
                  className="p-3 rounded-lg bg-gray-100 w-full "
                  name="sleeveLength"
                  value={information.sleeveLength}
                  onChange={handleChange}
                >
                  <option value="">Sleeve Length</option>
                  <option>Sleeveless</option>
                  <option>Short Sleeve</option>
                  <option>Half Sleeve</option>
                  <option>Full Sleeve</option>
                </select>
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full "
                  name="shipsIn"
                  value={information.shipsIn}
                  onChange={handleChange}
                >
                  <option value="">Ships In (Days)</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full "
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

            {/* Price, Stock, Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input
                className="p-3 rounded-lg bg-gray-100 w-full "
                name="price"
                type="number"
                placeholder="Price (INR)"
                value={information.price}
                onChange={handleChange}
              />
              <input
                className="p-3 rounded-lg bg-gray-100 w-full "
                name="stock"
                type="number"
                placeholder="Stock"
                value={information.stock}
                onChange={handleChange}
              />
            </div>

            <div className="mb-6">
              <textarea
                className="p-3 rounded-lg bg-gray-100 w-full "
                name="description"
                placeholder="Description"
                value={information.description}
                onChange={handleChange}
              ></textarea>
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
                  src={URL.createObjectURL(mainImageFile)}
                  alt="Main"
                  className="w-32 h-40 object-cover rounded mx-auto mt-4"
                />
              )}
            </div>

            {/* Additional Images */}
            <div className="mb-6">
              <label className="block text-gray-600 mb-2">Additional Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full p-3 rounded-lg bg-gray-100"
              />
              <div className="flex flex-wrap gap-4 mt-4">
                {uploadedImages.map((img, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(img)}
                    alt={`Upload ${i}`}
                    className="w-20 h-24 object-cover rounded "
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            {message && (
              <p className="text-center text-xl font-bold mb-6">{message}</p>
            )}
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
