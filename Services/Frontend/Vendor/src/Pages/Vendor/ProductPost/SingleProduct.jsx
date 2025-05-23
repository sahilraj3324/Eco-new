import { useState, useEffect } from "react";
import axios from "axios";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../Firebase/firebase";
import { v4 as uuidv4 } from "uuid";

const SingleProduct = () => {
  const [sellerId, setSellerId] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

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
    variants: [],
    top: "false",
    trending: "false"
  });

  const [newColor, setNewColor] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colorPalette = [
    { name: "Red", value: "#FF0000" },
    { name: "Blue", value: "#0000FF" },
    { name: "Green", value: "#008000" },
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Yellow", value: "#FFFF00" },
    { name: "Purple", value: "#800080" },
    { name: "Pink", value: "#FFC0CB" },
    { name: "Grey", value: "#808080" },
    { name: "Brown", value: "#A52A2A" },
    { name: "Orange", value: "#FFA500" },
    { name: "Navy", value: "#000080" },
    { name: "Teal", value: "#008080" },
    { name: "Maroon", value: "#800000" },
    { name: "Olive", value: "#808000" }
  ];

  useEffect(() => {
    const storedId = localStorage.getItem("Id");
    if (storedId) {
      setSellerId(storedId);
    }
    fetchCategories();
  }, []);

  // Effect to fetch subcategories when category changes
  useEffect(() => {
    if (information.category) {
      fetchSubcategories(information.category);
    } else {
      setSubcategories([]); // Clear subcategories when no category is selected
    }
  }, [information.category]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/Category/get-all");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage("Failed to load categories");
    }
  };

  const fetchSubcategories = async (categoryId) => {
    setLoadingSubcategories(true);
    try {
      const response = await axios.get(`/api/SubCategory/by-category/${categoryId}`);
      if (response.data && response.data.length > 0) {
        setSubcategories(response.data);
        setMessage(""); // Clear any existing messages
      } else {
        setSubcategories([]);
        setMessage(""); // Don't show error for empty subcategories
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
      if (error.response?.status === 404) {
        setMessage(""); // Don't show error for 404
      } else {
        setMessage("Failed to load subcategories. Please try again.");
      }
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInformation((prev) => ({ ...prev, [name]: value }));

    // Reset subcategory when category changes
    if (name === "category") {
      setInformation(prev => ({ ...prev, subcategory: "" }));
    }
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

  const handleAddColor = (colorName, colorValue) => {
    if (colorName && !information.variants.some(v => v.color === colorName)) {
      setInformation(prev => ({
        ...prev,
        variants: [...prev.variants, {
          color: colorName,
          colorValue: colorValue,
          sizes: []
        }]
      }));
      setNewColor("");
      setShowColorPicker(false);
    }
  };

  const handleSizeChange = (colorIndex, size, checked) => {
    setInformation(prev => {
      const updatedVariants = [...prev.variants];
      const variant = updatedVariants[colorIndex];
      if (checked) {
        // Only add if not already present
        if (!variant.sizes.some(s => s.size === size)) {
          variant.sizes = [...variant.sizes, {
            size,
            weight: "",
            stock: "",
            price: ""
          }];
        }
      } else {
        // Remove size from the color variant
        variant.sizes = variant.sizes.filter(s => s.size !== size);
      }
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };

  const handleVariantChange = (colorIndex, sizeIndex, field, value) => {
    setInformation(prev => {
      const updatedVariants = [...prev.variants];
      const variant = updatedVariants[colorIndex];
      variant.sizes[sizeIndex] = {
        ...variant.sizes[sizeIndex],
        [field]: value
      };
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };

  const handleRemoveColor = (colorIndex) => {
    setInformation(prev => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== colorIndex)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    if (!information.name || !information.price || !sellerId) {
      setMessage("❌ Please fill all required fields.");
      setLoading(false);
      return;
    }

    // Validate variants
    const invalidVariants = information.variants.some(
      v => !v.color || v.sizes.length === 0 || v.sizes.some(s => !s.stock || !s.price)
    );
    if (invalidVariants) {
      setMessage("❌ Please fill all variant details (color, sizes, and stock).");
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

      // Flatten variants for API
      const flattenedVariants = information.variants.flatMap(variant => 
        variant.sizes.map(size => ({
          id: uuidv4(),
          color: variant.color,
          size: size.size,
          weight: size.weight || "",
          stock: size.stock,
          price: Number(size.price) || 0
        }))
      );

      // Calculate total stock
      const totalStock = flattenedVariants.reduce((sum, variant) => {
        return sum + (parseInt(variant.stock) || 0);
      }, 0);

      const product = {
        name: information.name,
        description: information.description,
        price: parseFloat(information.price),
        stock: totalStock,
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
        variants: flattenedVariants,
        variantsJson: JSON.stringify(flattenedVariants),
        status: "In Review",
        top: information.top,
        trending: information.trending
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
        variants: [],
        top: "false",
        trending: "false"
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
              <div>
                <select
                  name="category"
                  value={information.category}
                  onChange={handleChange}
                  className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  name="subcategory"
                  value={information.subcategory}
                  onChange={handleChange}
                  className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  disabled={!information.category || loadingSubcategories}
                >
                  <option value="">Select Subcategory</option>
                  {loadingSubcategories ? (
                    <option disabled>Loading subcategories...</option>
                  ) : subcategories.length === 0 ? (
                    <option disabled>No subcategories available</option>
                  ) : (
                    subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.subCategoryName}
                      </option>
                    ))
                  )}
                </select>
                {message && message !== "" && (
                  <p className="text-sm text-red-500 mt-1">{message}</p>
                )}
              </div>
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
                <option value="6204">6204 - Women's Garments</option>
                <option value="6110">6110 - Sweaters</option>
                <option value="6403">6403 - Footwear</option>
              </select>
            </div>

            {/* Sizes & Colors */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Product Variants</h3>
              
              {/* Add Color Input */}
              <div className="mb-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Add Color</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        onFocus={() => setShowColorPicker(true)}
                        className="p-2 border rounded w-full"
                        placeholder="Select or enter color name"
                      />
                      {showColorPicker && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg p-4">
                          <div className="grid grid-cols-3 gap-2">
                            {colorPalette.map((color) => (
                              <button
                                key={color.name}
                                type="button"
                                onClick={() => handleAddColor(color.name, color.value)}
                                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
                              >
                                <div
                                  className="w-6 h-6 rounded-full border"
                                  style={{ backgroundColor: color.value }}
                                />
                                <span>{color.name}</span>
                              </button>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="flex-1 p-2 border rounded"
                                placeholder="Or enter custom color name"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddColor(newColor, "#000000")}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              >
                                Add Custom
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Variants */}
              {information.variants.length > 0 && (
                <div className="space-y-6">
                  {information.variants.map((variant, colorIndex) => (
                    <div key={colorIndex} className="border p-4 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: variant.colorValue || variant.color.toLowerCase() }}
                          />
                          <h4 className="text-lg font-semibold">{variant.color}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(colorIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Size Selection */}
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Select Sizes</h5>
                        <div className="flex gap-4">
                          {["S", "M", "L", "XL", "XXL"].map((size) => (
                            <label key={size} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={variant.sizes.some(s => s.size === size)}
                                onChange={(e) => handleSizeChange(colorIndex, size, e.target.checked)}
                                className="mr-2"
                              />
                              {size}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Size Details */}
                      {variant.sizes.length > 0 && (
                        <div className="space-y-4">
                          <h5 className="font-medium">Size Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {variant.sizes.map((sizeVariant, sizeIndex) => (
                              <div key={sizeIndex} className="bg-white rounded border p-3">
                                <div className="mb-2">
                                  <label className="block text-sm font-medium">Size {sizeVariant.size}</label>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-sm text-gray-600">Weight (kg)</label>
                                    <input
                                      type="text"
                                      value={sizeVariant.weight || ""}
                                      onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'weight', e.target.value)}
                                      className="p-2 border rounded w-full"
                                      placeholder="Enter weight"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-gray-600">Stock</label>
                                    <input
                                      type="number"
                                      value={sizeVariant.stock || ""}
                                      onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'stock', e.target.value)}
                                      className="p-2 border rounded w-full"
                                      placeholder="Enter stock"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-gray-600">Price</label>
                                    <input
                                      type="number"
                                      value={sizeVariant.price || ""}
                                      onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'price', e.target.value)}
                                      className="p-2 border rounded w-full"
                                      placeholder="Enter Price"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                className="bg-cyan-500 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-all duration-300"
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
