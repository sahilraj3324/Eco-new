import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { CloudUpload, FileText, Upload, Image, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../../Firebase/firebase";

const BulkUpload = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [sellerId, setSellerId] = useState("");
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("Id");
    if (storedUserId) {
      setSellerId(storedUserId);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    setMessage("");

    if (!file) return;

    Papa.parse(file, {
      header: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        const parsed = result.data.map((item) => {
          // Parse variants string into array of objects
          const variantStrings = item.variants?.split("|") || [];
          const variants = variantStrings.map((v) => {
            const [size, color, weight, stock, price] = v.split(",");
            return {
              id: uuidv4(),
              size: size?.trim() || "",
              color: color?.trim() || "",
              weight: weight?.trim() || "",
              stock: stock?.trim() || "",
              price: Number(price) || 0,
              stock2: stock?.trim() || ""
            };
          });

          return {
            id: uuidv4(),
            name: item.name?.trim() || "",
            description: item.description?.trim() || "",
            price: parseFloat(item.price) || 0,
            stock: parseInt(item.stock, 10) || 0,
            sellerId,
            category: item.category?.trim() || "",
            brand: item.brand?.trim() || "",
            material: item.material?.trim() || "",
            status: "In Review",
            imageFiles: [],
            imageUrls: [],
            imageUrlsJson: "[]",
            variants,
            variantsJson: JSON.stringify(variants),
            createdAt: new Date().toISOString(),
            subcategory: item.subcategory?.trim() || "",
            gst: item.gst?.trim() || "5%",
            hsn1: item.hsn1?.trim() || "",
            moq: item.moq?.trim() || "",
            piecesPerPack: item.piecesPerPack?.trim() || "",
            fitShape: item.fitShape?.trim() || "",
            neckType: item.neckType?.trim() || "",
            occasion: item.occasion?.trim() || "",
            pattern: item.pattern?.trim() || "",
            sleeveLength: item.sleeveLength?.trim() || "",
            shipsIn: item.shipsIn?.trim() || "",
            mainImage: "",
            top: "false",
            trending: "false",
            minOrderQuantity: item.minOrderQuantity?.trim() || ""
          };
        });

        setProducts(parsed);
        setMessage(`✅ Successfully parsed ${parsed.length} products from CSV`);
      },
      error: (error) => {
        setMessage(`❌ Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleImageUpload = (e, index) => {
    const files = Array.from(e.target.files);
    setProducts((prev) => {
      const updated = [...prev];
      updated[index].imageFiles = files;
      return updated;
    });
  };

  const uploadImagesToFirebase = async (product, index) => {
    const urls = [];

    for (let i = 0; i < product.imageFiles.length; i++) {
      const file = product.imageFiles[i];
      const fileName = `${product.id}_${file.name}`;
      const fileRef = ref(storage, `products/${fileName}`);
      
      try {
        const snapshot = await uploadBytesResumable(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        urls.push(downloadURL);
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            images: Math.round(((i + 1) / product.imageFiles.length) * 100)
          }
        }));
      } catch (error) {
        console.error(`Error uploading image ${i + 1} for product ${index}:`, error);
      }
    }

    return urls;
  };

  const handleUpload = async () => {
    if (!products.length) {
      setMessage("❌ Please upload a CSV file first.");
      return;
    }

    const productsWithoutImages = products.filter(p => !p.imageFiles || p.imageFiles.length === 0);
    if (productsWithoutImages.length > 0) {
      setMessage("❌ Please upload images for all products before proceeding.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const finalProducts = [];

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        setUploadProgress(prev => ({
          ...prev,
          [i]: { product: 0, images: 0 }
        }));

        const imageUrls = await uploadImagesToFirebase(product, i);
        
        finalProducts.push({
          ...product,
          imageUrls,
          imageUrlsJson: JSON.stringify(imageUrls),
          mainImage: imageUrls[0] || "",
          variantsJson: JSON.stringify(product.variants)
        });

        setUploadProgress(prev => ({
          ...prev,
          [i]: { ...prev[i], product: 100 }
        }));
      }

      const response = await axios.post("/api/Product/add/bulk", finalProducts, {
        headers: { "Content-Type": "application/json" }
      });

      setMessage(`✅ Successfully uploaded ${response.data.count || finalProducts.length} products!`);
      
      // Reset form
      setCsvFile(null);
      setProducts([]);
      setUploadProgress({});
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"][accept=".csv"]');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error("Backend error:", error.response?.data || error.message);
      setMessage(`❌ Failed to upload products: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,description,price,stock,category,subcategory,brand,material,gst,hsn1,moq,piecesPerPack,fitShape,neckType,occasion,pattern,sleeveLength,shipsIn,minOrderQuantity,variants
T-Shirt Basic,Comfortable cotton t-shirt,299,100,Clothing,T-Shirts,BrandName,Cotton,5%,6109,10,1,Regular,Round Neck,Casual,Solid,Short Sleeve,2-3 days,1,"S,Red,100g,25,299|M,Red,120g,30,299|L,Red,140g,20,299"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bulk Product Upload</h2>
              <p className="text-gray-600">Upload multiple products at once using CSV format</p>
            </div>

            {/* Template Download */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Download CSV Template</p>
                    <p className="text-xs text-blue-700">Get the correct format for bulk upload</p>
                  </div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <CloudUpload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV File</h3>
              <p className="text-gray-600 mb-4">Select your CSV file with product data (max 50 products, 8MB)</p>
              
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="h-5 w-5 mr-2" />
                Choose CSV File
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
              
              {csvFile && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg inline-block">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">{csvFile.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mt-4 p-4 rounded-xl ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {message.includes('✅') ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Preview */}
        {products.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Product Preview</h3>
                  <p className="text-gray-600">Review and upload images for each product</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {products.length} Products
                </span>
              </div>

              <div className="grid gap-6">
                {products.map((product, index) => (
                  <div key={product.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Product Info */}
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h4>
                        <p className="text-gray-600 mb-3">{product.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Price:</span>
                            <span className="ml-1 text-green-600 font-semibold">₹{product.price}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Stock:</span>
                            <span className="ml-1">{product.stock}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Category:</span>
                            <span className="ml-1">{product.category}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Brand:</span>
                            <span className="ml-1">{product.brand}</span>
                          </div>
                        </div>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="mb-4">
                            <span className="font-medium text-gray-700 block mb-2">Variants:</span>
                            <div className="flex flex-wrap gap-2">
                              {product.variants.map((variant, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                                  {variant.size} - {variant.color} (₹{variant.price})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Upload */}
                      <div className="lg:w-80">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                          <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Images
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleImageUpload(e, index)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Image Preview */}
                        {product.imageFiles && product.imageFiles.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {product.imageFiles.length} image(s) selected
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {product.imageFiles.slice(0, 6).map((file, i) => (
                                <img
                                  key={i}
                                  src={URL.createObjectURL(file)}
                                  alt="Preview"
                                  className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                />
                              ))}
                              {product.imageFiles.length > 6 && (
                                <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                                  +{product.imageFiles.length - 6}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Upload Progress */}
                        {uploading && uploadProgress[index] && (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Images</span>
                              <span>{uploadProgress[index].images || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress[index].images || 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Uploading Products...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload All Products
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
