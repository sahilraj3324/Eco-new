import { useState, useEffect } from "react";
import axios from "axios";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase";
import { v4 as uuidv4 } from "uuid";
import { 
  Plus, Minus, Upload, Image, X, Check, AlertCircle, Loader2, 
  Package, Tag, Palette, Ruler, Shirt, Eye, Save 
} from "lucide-react";

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
    trending: "false",
    minOrderQuantity: ""
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
          price: Number(size.price) || 0,
          stock2: size.stock // Adding stock2 field as per schema
        }))
      );

      // Calculate total stock
      const totalStock = flattenedVariants.reduce((sum, variant) => {
        return sum + (parseInt(variant.stock) || 0);
      }, 0);

      // Find category and subcategory names from IDs
      const selectedCategory = categories.find(cat => cat.id === information.category);
      const selectedSubcategory = subcategories.find(subcat => subcat.id === information.subcategory);

      const product = {
        name: information.name,
        description: information.description,
        price: parseFloat(information.price),
        stock: totalStock,
        sellerId: sellerId,
        category: selectedCategory ? selectedCategory.categoryName : information.category,
        subcategory: selectedSubcategory ? selectedSubcategory.subCategoryName : information.subcategory,
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
        trending: information.trending,
        minOrderQuantity: information.minOrderQuantity
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
        trending: "false",
        minOrderQuantity: ""
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h2>
              <p className="text-red-600 font-semibold">Please Fill All Product Details Field Carefully</p>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {message.includes('✅') ? (
                    <Check className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Package className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={information.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={information.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={information.price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                    <input
                      type="text"
                      name="brand"
                      value={information.brand}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      name="category"
                      value={information.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                    <select
                      name="subcategory"
                      value={information.subcategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={!information.category || loadingSubcategories}
                    >
                      <option value="">Select Subcategory</option>
                      {loadingSubcategories ? (
                        <option disabled>Loading...</option>
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
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST *</label>
                    <select
                      name="gst"
                      value={information.gst}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select GST</option>
                      <option value="5%">5%</option>
                      <option value="12%">12%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code *</label>
                    <select
                      name="hsn1"
                      value={information.hsn1}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select HSN Code</option>
                      <option value="6109">6109 - T-shirts</option>
                      <option value="6204">6204 - Women's Garments</option>
                      <option value="6110">6110 - Sweaters</option>
                      <option value="6403">6403 - Footwear</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Palette className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Product Variants</h3>
            </div>

            {/* Add Color */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Add Color Variant *</label>
              <div className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onFocus={() => setShowColorPicker(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Select or enter color name"
                  />
                  
                  {showColorPicker && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-lg p-6">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {colorPalette.map((color) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => handleAddColor(color.name, color.value)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div
                              className="w-6 h-6 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.value }}
                            />
                            <span className="text-sm font-medium">{color.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Custom color name"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddColor(newColor, "#000000")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Color
                </button>
              </div>
            </div>

            {/* Color Variants Display */}
            {information.variants.length > 0 && (
              <div className="space-y-6">
                {information.variants.map((variant, colorIndex) => (
                  <div key={colorIndex} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: variant.colorValue || variant.color.toLowerCase() }}
                        />
                        <h4 className="text-xl font-semibold text-gray-900">{variant.color}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(colorIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Size Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Available Sizes</label>
                      <div className="flex flex-wrap gap-3">
                        {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                          <label key={size} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={variant.sizes.some(s => s.size === size)}
                              onChange={(e) => handleSizeChange(colorIndex, size, e.target.checked)}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Size Details */}
                    {variant.sizes.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Size Details</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {variant.sizes.map((sizeVariant, sizeIndex) => (
                            <div key={sizeIndex} className="bg-white rounded-lg border border-gray-200 p-4">
                              <div className="mb-3">
                                <div className="flex items-center">
                                  <Ruler className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="font-medium text-gray-900">Size {sizeVariant.size}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
                                  <input
                                    type="text"
                                    value={sizeVariant.weight || ""}
                                    onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'weight', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="0.5"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
                                  <input
                                    type="number"
                                    value={sizeVariant.stock || ""}
                                    onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'stock', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="100"
                                    min="0"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Price *</label>
                                  <input
                                    type="number"
                                    value={sizeVariant.price || ""}
                                    onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'price', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="299"
                                    min="0"
                                    required
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

          {/* Additional Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Shirt className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Additional Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                <input
                  type="text"
                  name="material"
                  value={information.material}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Cotton, Polyester"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fit Shape *</label>
                <input
                  type="text"
                  name="fitShape"
                  value={information.fitShape}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Regular, Slim, Loose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neck Type *</label>
                <select
                  name="neckType"
                  value={information.neckType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Neck Type</option>
                  <option value="Round Neck">Round Neck</option>
                  <option value="V-Neck">V-Neck</option>
                  <option value="Collar">Collar</option>
                  <option value="Boat Neck">Boat Neck</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occasion *</label>
                <select
                  name="occasion"
                  value={information.occasion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Occasion</option>
                  <option value="Casual">Casual</option>
                  <option value="Formal">Formal</option>
                  <option value="Party">Party</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pattern *</label>
                <input
                  type="text"
                  name="pattern"
                  value={information.pattern}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Solid, Striped, Printed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sleeve Length *</label>
                <select
                  name="sleeveLength"
                  value={information.sleeveLength}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Sleeve Length</option>
                  <option value="Short Sleeve">Short Sleeve</option>
                  <option value="Long Sleeve">Long Sleeve</option>
                  <option value="Sleeveless">Sleeveless</option>
                  <option value="3/4 Sleeve">3/4 Sleeve</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Quantity (MOQ) *</label>
                <input
                  type="text"
                  name="moq"
                  value={information.moq}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Minimum order quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pieces per Pack *</label>
                <input
                  type="text"
                  name="piecesPerPack"
                  value={information.piecesPerPack}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Number of pieces"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ships In * </label>
                <input
                  type="text"
                  name="shipsIn"
                  value={information.shipsIn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 2-3 days"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Image className="h-6 w-6 text-orange-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Product Images *</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Main Product Image *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Upload className="h-5 w-5 mr-2" />
                    Choose Main Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 1MB</p>
                  
                  {mainImageFile && (
                    <div className="mt-4">
                      <img
                        src={URL.createObjectURL(mainImageFile)}
                        alt="Main preview"
                        className="h-32 w-32 object-cover rounded-lg mx-auto border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Additional Images *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Upload className="h-5 w-5 mr-2" />
                    Choose Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Multiple images allowed</p>
                  
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {uploadedImages.slice(0, 6).map((file, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                      {uploadedImages.length > 6 && (
                        <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                          +{uploadedImages.length - 6}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Save className="h-6 w-6 mr-3" />
                    Add Product
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-500 mt-3">
                Your product will be submitted for review and approval
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SingleProduct;
