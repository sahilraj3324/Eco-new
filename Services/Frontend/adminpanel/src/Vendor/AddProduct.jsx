import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../Vendor/src/Firebase/firebase';

const AddProduct = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [sellerId, setSellerId] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    subcategory: '',
    gst: '5%',
    hsn1: '',
    moq: '',
    piecesPerPack: '',
    material: '',
    fitShape: '',
    neckType: '',
    occasion: '',
    pattern: '',
    sleeveLength: '',
    shipsIn: '',
    brand: '',
    sizes: [],
    colors: [],
    weights: {},
  });

  useEffect(() => {
    if (vendorId) {
      console.log('Using vendorId from URL parameters:', vendorId);
      setSellerId(vendorId);
    } else {
      console.log('No vendorId found in URL parameters');
      // Fall back to localStorage
      const storedId = localStorage.getItem('Id');
      if (storedId) {
        console.log('Using Id from localStorage:', storedId);
        setSellerId(storedId);
      } else {
        console.log('No sellerId found in localStorage either');
      }
    }
  }, [vendorId]);

  // Fetch categories when component loads
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await api.category.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setMessage('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!product.category) {
        setSubcategories([]);
        return;
      }

      try {
        setLoadingSubcategories(true);
        const data = await api.subCategory.getByCategoryId(product.category);
        setSubcategories(data);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setSubcategories([]);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [product.category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      // Reset subcategory when category changes
      setProduct(prev => ({
        ...prev,
        [name]: value,
        subcategory: ''
      }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
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
        'state_changed',
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
    setProduct((prev) => {
      const updatedArray = checked
        ? [...prev[name], value]
        : prev[name].filter((item) => item !== value);
      return { ...prev, [name]: updatedArray };
    });
  };

  const handleSizeChange = (e) => {
    const { value, checked } = e.target;
    setProduct((prev) => {
      let updatedSizes = checked
        ? [...prev.sizes, value]
        : prev.sizes.filter((s) => s !== value);

      let updatedWeights = { ...prev.weights };
      if (checked) {
        updatedWeights[value] = '';
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
    setProduct((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [size]: value,
      },
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!product.name || !product.price || !product.stock || !sellerId) {
      setMessage('❌ Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      const imageUrls = await Promise.all(
        uploadedImages.map((file) => uploadToFirebase(file, 'products'))
      );

      const mainImageUrl = mainImageFile
        ? await uploadToFirebase(mainImageFile, 'products')
        : '';

      const variants = [];
      for (const size of product.sizes) {
        for (const color of product.colors) {
          variants.push({
            Size: size,
            Color: color,
            Weight: product.weights[size] || '',
          });
        }
      }

      const newProduct = {
        ...product,
        sellerId,
        mainImage: mainImageUrl,
        imageUrls,
        imageUrlsJson: JSON.stringify(imageUrls),
        variants,
        variantsJson: JSON.stringify(variants),
        status: 'In Review',
      };

      await api.product.add(newProduct);
      setMessage('✅ Product added successfully!');
      setProduct({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        subcategory: '',
        gst: '5%',
        hsn1: '',
        moq: '',
        piecesPerPack: '',
        material: '',
        fitShape: '',
        neckType: '',
        occasion: '',
        pattern: '',
        sleeveLength: '',
        shipsIn: '',
        brand: '',
        sizes: [],
        colors: [],
        weights: {},
      });
      setUploadedImages([]);
      setMainImageFile(null);
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setMessage(`❌ Upload failed: ${error.response?.data?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        <form onSubmit={handleAddProduct}>
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-start mb-5 text-gray-500">
              Add Product
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <select
                name="category"
                value={product.category}
                onChange={handleInputChange}
                className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                disabled={loadingCategories}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>

              <select
                name="subcategory"
                value={product.subcategory}
                onChange={handleInputChange}
                className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                disabled={loadingSubcategories || !product.category}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.subCategoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <select
                name="gst"
                value={product.gst}
                onChange={handleInputChange}
                className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              >
                <option value="">Select GST</option>
                <option value="5%">5%</option>
                <option value="12%">12%</option>
              </select>

              <select
                name="hsn1"
                value={product.hsn1}
                onChange={handleInputChange}
                className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              >
                <option value="">Select HSN Code</option>
                <option value="6109">6109 - T-shirts</option>
                <option value="6204">6204 - Women's Garments</option>
                <option value="6110">6110 - Sweaters</option>
                <option value="6403">6403 - Footwear</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Select Size</h3>
                <div className="flex gap-4">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        value={size}
                        checked={product.sizes.includes(size)}
                        onChange={handleSizeChange}
                        className="mr-2"
                      />
                      {size}
                    </label>
                  ))}
                </div>

                {product.sizes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Enter Weight for Selected Sizes</h4>
                    {product.sizes.map((size) => (
                      <div key={size} className="mb-2">
                        <label className="block mb-1">{size} Weight (kg):</label>
                        <input
                          type="text"
                          value={product.weights[size] || ''}
                          onChange={(e) => handleWeightChange(size, e.target.value)}
                          className="p-2 border rounded w-full"
                          placeholder={`Enter weight for size ${size}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Select Color</h3>
                <div className="flex gap-4">
                  {['Red', 'Blue', 'Green', 'Black'].map((c) => (
                    <label key={c} className="flex items-center">
                      <input
                        type="checkbox"
                        name="colors"
                        value={c}
                        checked={product.colors.includes(c)}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="name"
                  placeholder="Product Name"
                  value={product.name}
                  onChange={handleInputChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="moq"
                  placeholder="MOQ (packs)"
                  value={product.moq}
                  onChange={handleInputChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="piecesPerPack"
                  placeholder="Pieces per Pack"
                  value={product.piecesPerPack}
                  onChange={handleInputChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="material"
                  placeholder="Fabric Material"
                  value={product.material}
                  onChange={handleInputChange}
                />
                <input
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="fitShape"
                  placeholder="Fit Shape"
                  value={product.fitShape}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-4">
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="neckType"
                  value={product.neckType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Neck Type</option>
                  <option>Round Neck</option>
                  <option>V-Neck</option>
                  <option>Collar</option>
                  <option>Boat Neck</option>
                </select>
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="occasion"
                  value={product.occasion}
                  onChange={handleInputChange}
                >
                  <option value="">Select Occasion</option>
                  <option>Casual</option>
                  <option>Formal</option>
                  <option>Party</option>
                  <option>Festive</option>
                </select>
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="pattern"
                  value={product.pattern}
                  onChange={handleInputChange}
                >
                  <option value="">Select Pattern</option>
                  <option>Solid</option>
                  <option>Striped</option>
                  <option>Printed</option>
                  <option>Checked</option>
                </select>
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="sleeveLength"
                  value={product.sleeveLength}
                  onChange={handleInputChange}
                >
                  <option value="">Sleeve Length</option>
                  <option>Sleeveless</option>
                  <option>Short Sleeve</option>
                  <option>Half Sleeve</option>
                  <option>Full Sleeve</option>
                </select>
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="shipsIn"
                  value={product.shipsIn}
                  onChange={handleInputChange}
                >
                  <option value="">Ships In (Days)</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                <select
                  className="p-3 rounded-lg bg-gray-100 w-full"
                  name="brand"
                  value={product.brand}
                  onChange={handleInputChange}
                >
                  <option value="">Select Brand</option>
                  <option>Brand A</option>
                  <option>Brand B</option>
                  <option>Brand C</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input
                className="p-3 rounded-lg bg-gray-100 w-full"
                name="price"
                type="number"
                placeholder="Price (INR)"
                value={product.price}
                onChange={handleInputChange}
              />
              <input
                className="p-3 rounded-lg bg-gray-100 w-full"
                name="stock"
                type="number"
                placeholder="Stock"
                value={product.stock}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-6">
              <textarea
                className="p-3 rounded-lg bg-gray-100 w-full"
                name="description"
                placeholder="Description"
                value={product.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

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
                    className="w-20 h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>

            {message && (
              <p className="text-center text-xl font-bold mb-6">{message}</p>
            )}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-500 text-white p-3 rounded shadow-md hover:bg-blue-700 transition-all duration-300"
              >
                {loading ? 'Submitting...' : 'Add Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct; 