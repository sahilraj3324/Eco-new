import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { CloudUpload } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'
  const [sellerId, setSellerId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Single Product States
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [newColor, setNewColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [information, setInformation] = useState({
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
    variants: [],
    top: 'false',
    trending: 'false'
  });

  // Bulk Upload States
  const [csvFile, setCsvFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const colorPalette = [
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#008000' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Purple', value: '#800080' },
    { name: 'Pink', value: '#FFC0CB' },
    { name: 'Grey', value: '#808080' },
    { name: 'Brown', value: '#A52A2A' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Navy', value: '#000080' },
    { name: 'Teal', value: '#008080' },
    { name: 'Maroon', value: '#800000' },
    { name: 'Olive', value: '#808000' }
  ];

  useEffect(() => {
    if (vendorId) {
      setSellerId(vendorId);
    } else {
      // Fall back to localStorage
      const storedId = localStorage.getItem('Id');
      if (storedId) {
        setSellerId(storedId);
      } else {
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
      if (!information.category) {
        setSubcategories([]);
        return;
      }

      try {
        setLoadingSubcategories(true);
        const data = await api.subCategory.getByCategoryId(information.category);
        setSubcategories(data);
      } catch (err) {
        setSubcategories([]);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [information.category]);

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

  // Single Product Functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInformation((prev) => ({ ...prev, [name]: value }));

    // Reset subcategory when category changes
    if (name === 'category') {
      setInformation(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const handleImageUpload = (e) => {
    setUploadedImages(Array.from(e.target.files));
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    setMainImageFile(file);
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
      setNewColor('');
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
            weight: '',
            stock: '',
            stock2: '',
            height: '',
            width: '',
            length: '',
            price: ''
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
    setMessage('');
    
    if (!information.name || !information.price || !sellerId) {
      setMessage('❌ Please fill all required fields.');
      setLoading(false);
      return;
    }

    // Validate variants
    const invalidVariants = information.variants.some(
      v => !v.color || v.sizes.length === 0 || v.sizes.some(s => !s.stock || !s.price)
    );
    if (invalidVariants) {
      setMessage('❌ Please fill all variant details (color, sizes, and stock).');
      setLoading(false);
      return;
    }

    try {
      // Upload images
      const imageUrls = await Promise.all(
        uploadedImages.map((file) => uploadToFirebase(file, 'products'))
      );

      const mainImageUrl = mainImageFile
        ? await uploadToFirebase(mainImageFile, 'products')
        : '';

      // Flatten variants for API
      const flattenedVariants = information.variants.flatMap(variant => 
        variant.sizes.map(size => ({
          id: uuidv4(),
          color: variant.color,
          size: size.size,
          weight: size.weight || '',
          stock: size.stock,
          stock2: size.stock2 || '',
          height: parseFloat(size.height) || 0,
          width: parseFloat(size.width) || 0,
          length: parseFloat(size.length) || 0,
          price: Number(size.price) || 0
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
        status: 'In Review',
        top: information.top,
        trending: information.trending
      };

      await api.product.add(product);
      setMessage('✅ Product added successfully!');
      
      // Reset form
      setInformation({
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
        variants: [],
        top: 'false',
        trending: 'false'
      });
      setUploadedImages([]);
      setMainImageFile(null);
    } catch (err) {
      setMessage(`❌ Upload failed: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Bulk Upload Functions
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        const parsed = result.data.map((item) => {
          // Parse variants string into array of objects
          const variantStrings = item.variants?.split('|') || [];
          const variants = variantStrings.map((v) => {
            const [size, color, weight, stock, stock2, height, width, length, price] = v.split(',');
            return {
              id: uuidv4(),
              size: size?.trim() || '',
              color: color?.trim() || '',
              weight: weight?.trim() || '',
              stock: stock?.trim() || '',
              stock2: stock2?.trim() || '',
              height: parseFloat(height) || 0,
              width: parseFloat(width) || 0,
              length: parseFloat(length) || 0,
              price: Number(price) || 0
            };
          });

          return {
            id: uuidv4(),
            name: item.name?.trim() || '',
            description: item.description?.trim() || '',
            price: parseFloat(item.price) || 0,
            stock: parseInt(item.stock, 10) || 0,
            sellerId,
            category: item.category?.trim() || '',
            brand: item.brand?.trim() || '',
            material: item.material?.trim() || '',
            status: 'In Review',
            imageFiles: [],
            imageUrls: [],
            imageUrlsJson: '[]',
            variants,
            variantsJson: JSON.stringify(variants),
            createdAt: new Date().toISOString(),
            subcategory: item.subcategory?.trim() || '',
            gst: item.gst?.trim() || '5%',
            hsn1: item.hsn1?.trim() || '',
            moq: item.moq?.trim() || '',
            piecesPerPack: item.piecesPerPack?.trim() || '',
            fitShape: item.fitShape?.trim() || '',
            neckType: item.neckType?.trim() || '',
            occasion: item.occasion?.trim() || '',
            pattern: item.pattern?.trim() || '',
            sleeveLength: item.sleeveLength?.trim() || '',
            shipsIn: item.shipsIn?.trim() || '',
            mainImage: '',
            top: 'false',
            trending: 'false'
          };
        });

        setProducts(parsed);
      }
    });
  };

  const handleBulkImageUpload = (e, index) => {
    const files = Array.from(e.target.files);
    setProducts((prev) => {
      const updated = [...prev];
      updated[index].imageFiles = files;
      return updated;
    });
  };

  const uploadImagesToFirebase = async (product) => {
    const urls = [];

    for (const file of product.imageFiles) {
      const fileName = `${product.id}_${file.name}`;
      const fileRef = ref(storage, `products/${fileName}`);
      const snapshot = await uploadBytesResumable(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      urls.push(downloadURL);
    }

    return urls;
  };

  const handleBulkUpload = async () => {
    if (!products.length) {
      setMessage('Please upload a CSV first.');
      return;
    }

    setUploading(true);

    try {
      const finalProducts = [];

      for (const product of products) {
        const imageUrls = await uploadImagesToFirebase(product);
        finalProducts.push({
          ...product,
          imageUrls,
          imageUrlsJson: JSON.stringify(imageUrls),
          mainImage: imageUrls[0] || '',
          variantsJson: JSON.stringify(product.variants)
        });
      }

      await api.product.addBulk(finalProducts);
      setMessage(`✅ Uploaded ${finalProducts.length} products successfully.`);
      
      // Reset bulk upload
      setCsvFile(null);
      setProducts([]);
    } catch (error) {
      setMessage('❌ Failed to upload products. See console for details.');
    } finally {
      setUploading(false);
    }
  };

  const renderSingleProduct = () => (
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
              disabled={loadingCategories}
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
                            onClick={() => handleAddColor(newColor, '#000000')}
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
                      {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {variant.sizes.map((sizeVariant, sizeIndex) => (
                          <div key={sizeIndex} className="bg-white rounded border p-3">
                            <div className="mb-2">
                              <label className="block text-sm font-medium">Size {sizeVariant.size}</label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm text-gray-600">Weight (kg)</label>
                                <input
                                  type="text"
                                  value={sizeVariant.weight || ''}
                                  onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'weight', e.target.value)}
                                  className="p-2 border rounded w-full text-sm"
                                  placeholder="Enter weight"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600">Stock</label>
                                <input
                                  type="number"
                                  value={sizeVariant.stock || ''}
                                  onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'stock', e.target.value)}
                                  className="p-2 border rounded w-full text-sm"
                                  placeholder="Enter stock"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600">Stock2</label>
                                <input
                                  type="number"
                                  value={sizeVariant.stock2 || ''}
                                  onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'stock2', e.target.value)}
                                  className="p-2 border rounded w-full text-sm"
                                  placeholder="Enter stock2"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600">Price</label>
                                <input
                                  type="number"
                                  value={sizeVariant.price || ''}
                                  onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'price', e.target.value)}
                                  className="p-2 border rounded w-full text-sm"
                                  placeholder="Enter Price"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600">Height</label>
                                <input
                                  type="number"
                                  value={sizeVariant.height || ''}
                                  onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'height', e.target.value)}
                                  className="p-2 border rounded w-full text-sm"
                                  placeholder="Enter height"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600">Width</label>
                                <input
                                  type="number"
                                  value={sizeVariant.width || ''}
                                  onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'width', e.target.value)}
                                  className="p-2 border rounded w-full text-sm"
                                  placeholder="Enter width"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600">Length</label>
                                <input
                                  type="number"
                                  value={sizeVariant.length || ''}
                                  onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'length', e.target.value)}
                                  className="p-2 border rounded w-full text-sm"
                                  placeholder="Enter length"
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
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="name"
              type="text"
              required
              placeholder="Product Name"
              value={information.name}
              onChange={handleChange}
              style={{
                borderColor: !information.name ? '#ef4444' : '#d1d5db',
                backgroundColor: !information.name ? '#fef2f2' : '#f3f4f6'
              }}
            />
            <input
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="moq"
              placeholder="MOQ (packs)"
              value={information.moq}
              onChange={handleChange}
            />
            <input
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="piecesPerPack"
              placeholder="Pieces per Pack"
              value={information.piecesPerPack}
              onChange={handleChange}
            />
            <input
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="material"
              placeholder="Fabric Material"
              value={information.material}
              onChange={handleChange}
            />
            <input
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="fitShape"
              placeholder="Fit Shape"
              value={information.fitShape}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-4">
            <select
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="neckType"
              value={information.neckType}
              onChange={handleChange}
            >
              <option value="">Select Neck Type</option>
              <option value="Round Neck">Round Neck</option>
              <option value="V-Neck">V-Neck</option>
              <option value="Collar">Collar</option>
              <option value="Boat Neck">Boat Neck</option>
            </select>
            <select
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="occasion"
              value={information.occasion}
              onChange={handleChange}
            >
              <option value="">Select Occasion</option>
              <option value="Casual">Casual</option>
              <option value="Formal">Formal</option>
              <option value="Party">Party</option>
              <option value="Festive">Festive</option>
            </select>
            <select
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="pattern"
              value={information.pattern}
              onChange={handleChange}
            >
              <option value="">Select Pattern</option>
              <option value="Solid">Solid</option>
              <option value="Striped">Striped</option>
              <option value="Printed">Printed</option>
              <option value="Checked">Checked</option>
            </select>
            <select
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="sleeveLength"
              value={information.sleeveLength}
              onChange={handleChange}
            >
              <option value="">Sleeve Length</option>
              <option value="Sleeveless">Sleeveless</option>
              <option value="Short Sleeve">Short Sleeve</option>
              <option value="Half Sleeve">Half Sleeve</option>
              <option value="Full Sleeve">Full Sleeve</option>
            </select>
            <select
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
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
              className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              name="brand"
              value={information.brand}
              onChange={handleChange}
            >
              <option value="">Select Brand</option>
              <option value="Brand A">Brand A</option>
              <option value="Brand B">Brand B</option>
              <option value="Brand C">Brand C</option>
            </select>
          </div>
        </div>

        {/* Price, Stock, Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input
            className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price (INR)"
            value={information.price}
            onChange={handleChange}
          />
          <input
            className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
            name="stock"
            type="number"
            min="0"
            placeholder="Stock"
            value={information.stock}
            onChange={handleChange}
          />
        </div>

        <div className="mb-6">
          <textarea
            className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
            name="description"
            placeholder="Description"
            rows="4"
            value={information.description}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Main Image Upload */}
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <label className="block text-gray-600 mb-2 font-semibold">1. Main Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleMainImageUpload}
            className="w-full p-3 rounded-lg bg-white border border-gray-300"
          />
          {mainImageFile && (
            <div className="mt-4 flex justify-center">
              <img
                src={URL.createObjectURL(mainImageFile)}
                alt="Main Preview"
                className="w-32 h-40 object-cover rounded shadow-md"
              />
            </div>
          )}
        </div>

        {/* Additional Images */}
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <label className="block text-gray-600 mb-2 font-semibold">2. Additional Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full p-3 rounded-lg bg-white border border-gray-300"
          />
          <div className="flex flex-wrap gap-4 mt-4">
            {uploadedImages.map((img, i) => (
              <div key={i} className="relative">
                <span className="absolute -top-2 -left-2 bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                  {i + 1}
                </span>
                <img
                  src={URL.createObjectURL(img)}
                  alt={`Upload ${i + 1}`}
                  className="w-20 h-24 object-cover rounded border-2 border-gray-200 shadow-md"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className={`bg-cyan-500 text-white p-3 px-8 rounded-full shadow-md hover:bg-cyan-600 transition-all duration-300 flex items-center justify-center mx-auto min-w-[160px] ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Add Product'
            )}
          </button>
        </div>
      </div>
    </form>
  );

  const renderBulkUpload = () => (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-5 text-gray-500">
        Add Multiple Products To Your Catalogue
      </h2>

      <div className="bg-gray-200 p-6 rounded-2xl shadow-sm space-y-4 mb-6">
        <h3 className="text-md font-semibold text-gray-700">Upload Catalogue (Upto 50 Products)</h3>

        <div className="flex flex-col items-center text-center space-y-2">
          <CloudUpload size={80} className="text-blue-500" />
          <label className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200">
            Upload CSV File
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <p className="text-xs text-gray-500">Only CSV File. Max Size 8 MB</p>
        <p className="text-xs text-gray-500">Add product images below before uploading</p>
      </div>

      {products.length > 0 && (
        <div className="mt-10 text-left">
          <h3 className="text-lg font-semibold mb-4">Product Preview & Image Upload</h3>
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="border p-4 rounded-lg shadow-sm">
                <p className="font-medium text-xl text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-600">Category: {product.category}</p>
                <p className="text-sm text-gray-600">Subcategory: {product.subcategory}</p>
                <p className="font-semibold text-gray-900">Description: {product.description}</p>
                <div className="mt-2">
                  <label className="inline-block bg-cyan-600 text-white text-sm px-4 py-2 rounded-full cursor-pointer hover:bg-cyan-700 transition">
                    Upload Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleBulkImageUpload(e, index)}
                      className="hidden"
                    />
                  </label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {product.imageFiles?.map((file, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-center mt-6">
        <button
          className="bg-cyan-600 text-white px-6 py-3 rounded-full hover:bg-cyan-700 transition-colors"
          onClick={handleBulkUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Now'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-xl shadow-md p-4 mb-0">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'single'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Single Product
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'bulk'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-4 text-center font-bold ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'single' ? renderSingleProduct() : renderBulkUpload()}
      </div>
    </div>
  );
};

export default AddProduct; 
