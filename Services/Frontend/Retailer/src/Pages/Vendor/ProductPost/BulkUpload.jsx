import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { CloudUpload } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../Firebase/firebase"; // Your Firebase config file

const BulkUpload = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [sellerid, setSellerid] = useState("");
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("Id");
    if (storedUserId) {
      setSellerid(storedUserId);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        const parsed = result.data.map((item) => ({
          id: uuidv4(),
          name: item.name?.trim() || "",
          category: item.category?.trim() || "",
          description: item.description?.trim() || "",
          price: parseFloat(item.price) || 0,
          stock: parseInt(item.stock, 10) || 0,
          sellerId: sellerid,
          brand: item.brand?.trim() || "",
          color: item.color?.trim() || "",
          size: item.size?.trim() || "",
          material: item.material?.trim() || "",
          status: "In Review",
          imageFiles: [],
          imageUrls: [],
          imageUrlsJson: "[]",
          mainImage: "",
          createdAt: new Date().toISOString(),
          subcategory: item.subcategory?.trim() || "",
          gst: item.gst?.trim() || "",
          hsn1: item.hsn1?.trim() || "",
          weight: item.weight?.trim() || "",
          moq: item.moq?.trim() || "",
          piecesPerPack: item.piecesPerPack?.trim() || "",
          fitShape: item.fitShape?.trim() || "",
          neckType: item.neckType?.trim() || "",
          occasion: item.occasion?.trim() || "",
          pattern: item.pattern?.trim() || "",
          sleeveLength: item.sleeveLength?.trim() || "",
          shipsIn: item.shipsIn?.trim() || ""
        }));

        setProducts(parsed);
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

    for (const file of product.imageFiles) {
      const fileName = `${product.id}_${file.name}`;
      const fileRef = ref(storage, `products/${fileName}`);
      const snapshot = await uploadBytesResumable(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      urls.push(downloadURL);
    }

    return urls;
  };

  const handleUpload = async () => {
    if (!products.length) return alert("Please upload a CSV first.");

    setUploading(true);

    try {
      const productsWithUrls = [];

      for (const [index, product] of products.entries()) {
        const urls = await uploadImagesToFirebase(product, index);
        productsWithUrls.push({
          ...product,
          imageUrls: urls,
          imageUrlsJson: JSON.stringify(urls),
          mainImage: urls[0] || ""
        });
      }

      const response = await axios.post("/api/Product/add/bulk", productsWithUrls, {
        headers: { "Content-Type": "application/json" }
      });

      alert(`✅ Uploaded ${response.data.count} products successfully.`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading products. Check console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:py-10">
      <div className="w-full max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Add Multiple Products To Your Catalogue</h2>

        <div className="bg-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-md font-semibold text-gray-700">Upload Catalogue (Upto 50 Products)</h3>

          <div className="flex flex-col items-center text-center space-y-2">
            <CloudUpload size={80} className="text-blue-500" />
            <label className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200">
              Upload CSV File
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <p className="text-xs text-gray-500">Only CSV File. Max Size 8 MB</p>
          <p className="text-xs text-gray-500">You can add product images here before final upload</p>

          <button
            className="bg-cyan-600 text-white px-6 py-2 rounded-full hover:bg-cyan-700"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Now"}
          </button>
        </div>

        {products.length > 0 && (
          <div className="mt-10 text-left">
            <h3 className="text-lg font-semibold mb-4">Product Preview & Image Upload</h3>
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={product.id} className="border p-4 rounded-lg shadow-sm">
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-600">Category: {product.category}</p>
                  <div className="mt-2">
                    <label className="text-sm text-blue-700 cursor-pointer">
                      Upload Images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, index)}
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
      </div>
    </div>
  );
};

export default BulkUpload;
