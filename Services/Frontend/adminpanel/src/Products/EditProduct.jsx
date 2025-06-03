import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../../../Vendor/src/Firebase/firebase'
import { v4 as uuidv4 } from 'uuid'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  
  // Image upload states
  const [uploadedImages, setUploadedImages] = useState([])
  const [mainImageFile, setMainImageFile] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  
  // Color picker states
  const [newColor, setNewColor] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  
  // Product state with advanced variant system
  const [product, setProduct] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sellerId: '',
    status: '',
    category: '',
    subcategory: '',
    brand: '',
    material: '',
    gst: '5%',
    hsn1: '',
    moq: '',
    piecesPerPack: '',
    fitShape: '',
    neckType: '',
    occasion: '',
    pattern: '',
    sleeveLength: '',
    shipsIn: '',
    mainImage: '',
    imageUrls: [],
    variants: [],
    top: 'false',
    trending: 'false'
  })

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
  ]

  // Fetch product data when component loads
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await api.product.getById(id)
        console.log('Fetched product data:', data)
        
        // Parse variants from the API response
        let variants = []
        if (data.variants && Array.isArray(data.variants)) {
          // Group variants by color
          const variantsByColor = {}
          data.variants.forEach(variant => {
            const color = variant.color || 'Default'
            if (!variantsByColor[color]) {
              variantsByColor[color] = {
                color: color,
                colorValue: colorPalette.find(c => c.name === color)?.value || '#000000',
                sizes: []
              }
            }
            variantsByColor[color].sizes.push({
              size: variant.size || '',
              weight: variant.weight || '',
              stock: variant.stock || 0,
              price: variant.price || 0
            })
          })
          variants = Object.values(variantsByColor)
        }
        
        // Parse imageUrls
        let imageUrls = []
        if (Array.isArray(data.imageUrls)) {
          imageUrls = data.imageUrls
        } else if (typeof data.imageUrlsJson === 'string') {
          try {
            imageUrls = JSON.parse(data.imageUrlsJson)
          } catch (e) {
            console.warn('Failed to parse imageUrlsJson:', e)
          }
        }
        
        const processedProduct = {
          ...product,
          ...data,
          id: id,
          variants: variants,
          imageUrls: imageUrls,
          // Ensure these fields are strings for the form
          gst: data.gst || '5%',
          top: String(data.top || 'false'),
          trending: String(data.trending || 'false'),
          // Ensure sellerId is preserved (handle both case variations)
          sellerId: data.sellerId || data.SellerId || 'default-seller',
          // Store the original names for later conversion back to names when submitting
          originalCategoryName: data.category,
          originalSubcategoryName: data.subcategory,
          // Set flag to indicate this is initial load
          isInitialLoad: true
        }
        
        console.log('Processed product data:', processedProduct)
        console.log('Original category name:', data.category)
        console.log('Original subcategory name:', data.subcategory)
        console.log('Current product category value:', processedProduct.category)
        console.log('Current product subcategory value:', processedProduct.subcategory)
        setProduct(processedProduct)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError(`Failed to load product: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    } else {
      setLoading(false)
      setError('No product ID provided')
    }
  }, [id])

  // Combined effect to fetch categories and then process product
  useEffect(() => {
    const fetchCategoriesAndProcessProduct = async () => {
      try {
        setLoadingCategories(true)
        const categoriesData = await api.category.getAll()
        setCategories(categoriesData)
        
        // If product is loaded and we have category names, convert them to IDs
        if (product.isInitialLoad && product.originalCategoryName && categoriesData.length > 0) {
          console.log('Converting category name to ID immediately after categories load')
          console.log('Looking for category:', product.originalCategoryName)
          console.log('Available categories:', categoriesData.map(c => ({ id: c.id, name: c.categoryName })))
          
          const matchingCategory = categoriesData.find(cat => cat.categoryName === product.originalCategoryName)
          if (matchingCategory) {
            console.log('Found matching category immediately:', matchingCategory)
            setProduct(prev => ({
              ...prev,
              category: matchingCategory.id,
              categoryIdResolved: true,
              isInitialLoad: false
            }))
          } else {
            console.warn('No matching category found immediately for:', product.originalCategoryName)
            // Keep the original name if no match found
            setProduct(prev => ({
              ...prev,
              isInitialLoad: false
            }))
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategoriesAndProcessProduct()
  }, [product.isInitialLoad, product.originalCategoryName])

  // Convert subcategory name to ID after subcategories are loaded
  useEffect(() => {
    if (subcategories.length > 0 && product.originalSubcategoryName && !product.subcategoryIdResolved) {
      console.log('Converting subcategory name to ID:', product.originalSubcategoryName);
      console.log('Available subcategories:', subcategories.map(sc => ({ id: sc.id, name: sc.subCategoryName })));
      
      const matchingSubcategory = subcategories.find(subcat => subcat.subCategoryName === product.originalSubcategoryName)
      if (matchingSubcategory) {
        console.log('Found matching subcategory:', matchingSubcategory);
        setProduct(prev => ({
          ...prev,
          subcategory: matchingSubcategory.id,
          subcategoryIdResolved: true
        }))
      } else {
        console.warn('No matching subcategory found for:', product.originalSubcategoryName);
      }
    }
  }, [subcategories, product.originalSubcategoryName, product.subcategoryIdResolved])

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!product.category) {
        console.log('No category set, clearing subcategories');
        setSubcategories([])
        return
      }

      console.log('Fetching subcategories for category:', product.category);
      console.log('Category type:', typeof product.category);
      
      // Check if it's a valid GUID
      const isValidGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.category);
      console.log('Is it a GUID?', isValidGuid);

      // Only fetch subcategories if we have a valid GUID
      if (!isValidGuid) {
        console.log('Category is not a valid GUID, skipping subcategory fetch');
        return;
      }

      try {
        setLoadingSubcategories(true)
        const data = await api.subCategory.getByCategoryId(product.category)
        setSubcategories(data)
      } catch (err) {
        console.error('Error fetching subcategories:', err)
        setSubcategories([])
      } finally {
        setLoadingSubcategories(false)
      }
    }

    fetchSubcategories()
  }, [product.category])

  // Firebase upload function
  const uploadToFirebase = (file, path) => {
    return new Promise((resolve, reject) => {
      const imageRef = ref(storage, `${path}/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(imageRef, file)

      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(url)
        }
      )
    })
  }

  // Handle input changes for simple fields
  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    
    if (name === 'category') {
      setProduct(prev => ({
        ...prev,
        [name]: value,
        subcategory: '' // Reset subcategory when category changes
      }))
    } else if (type === 'number') {
      setProduct(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setProduct(prev => ({ ...prev, [name]: value }))
    }
  }

  // Image upload handlers
  const handleImageUpload = (e) => {
    setUploadedImages(Array.from(e.target.files))
  }

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0]
    setMainImageFile(file)
  }

  // Color and variant handlers
  const handleAddColor = (colorName, colorValue) => {
    if (colorName && !product.variants.some(v => v.color === colorName)) {
      setProduct(prev => ({
        ...prev,
        variants: [...prev.variants, {
          color: colorName,
          colorValue: colorValue,
          sizes: []
        }]
      }))
      setNewColor('')
      setShowColorPicker(false)
    }
  }

  const handleSizeChange = (colorIndex, size, checked) => {
    setProduct(prev => {
      const updatedVariants = [...prev.variants]
      const variant = updatedVariants[colorIndex]
      if (checked) {
        if (!variant.sizes.some(s => s.size === size)) {
          variant.sizes = [...variant.sizes, {
            size,
            weight: '',
            stock: '',
            price: ''
          }]
        }
      } else {
        variant.sizes = variant.sizes.filter(s => s.size !== size)
      }
      return {
        ...prev,
        variants: updatedVariants
      }
    })
  }

  const handleVariantChange = (colorIndex, sizeIndex, field, value) => {
    setProduct(prev => {
      const updatedVariants = [...prev.variants]
      const variant = updatedVariants[colorIndex]
      variant.sizes[sizeIndex] = {
        ...variant.sizes[sizeIndex],
        [field]: value
      }
      return {
        ...prev,
        variants: updatedVariants
      }
    })
  }

  const handleRemoveColor = (colorIndex) => {
    setProduct(prev => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== colorIndex)
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      setImageUploading(true)
      
      // Upload new images to Firebase
      let newImageUrls = [...product.imageUrls]
      
      if (uploadedImages.length > 0) {
        const additionalImageUrls = await Promise.all(
          uploadedImages.map((file) => uploadToFirebase(file, 'products'))
        )
        newImageUrls = [...newImageUrls, ...additionalImageUrls]
      }

      let mainImageUrl = product.mainImage
      if (mainImageFile) {
        mainImageUrl = await uploadToFirebase(mainImageFile, 'products')
      }

      setImageUploading(false)

      // Flatten variants for API (similar to AddProduct)
      const flattenedVariants = product.variants.flatMap(variant => 
        variant.sizes.map(size => {
          const stockValue = parseInt(size.stock) || 0
          const priceValue = parseFloat(size.price) || 0
          
          console.log(`Processing variant: ${variant.color} ${size.size} - stock: ${size.stock} -> ${stockValue} (${typeof stockValue}), price: ${size.price} -> ${priceValue} (${typeof priceValue})`)
          
          return {
            id: uuidv4(),
            color: variant.color || '',
            size: size.size || '',
            weight: size.weight || '',
            stock: String(stockValue),  // Convert to string as backend expects
            price: priceValue   // Keep as number for price
          }
        })
      )

      // Validate flattened variants
      console.log('Flattened variants:', flattenedVariants)
      flattenedVariants.forEach((variant, index) => {
        console.log(`Variant ${index}:`, {
          ...variant,
          stockType: typeof variant.stock,
          priceType: typeof variant.price
        })
      })

      // Calculate total stock
      const totalStock = flattenedVariants.reduce((sum, variant) => {
        return sum + (parseInt(variant.stock) || 0)
      }, 0)

      // Find category and subcategory names from IDs
      const selectedCategory = categories.find(cat => cat.id === product.category)
      const selectedSubcategory = subcategories.find(subcat => subcat.id === product.subcategory)

      const productData = {
        id: id,
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        stock: totalStock,
        sellerId: product.sellerId || 'default-seller',
        status: product.status || 'In Review',
        category: selectedCategory ? selectedCategory.categoryName : (product.originalCategoryName || product.category || ''),
        subcategory: selectedSubcategory ? selectedSubcategory.subCategoryName : (product.originalSubcategoryName || product.subcategory || ''),
        brand: product.brand || '',
        material: product.material || '',
        gst: product.gst || '5%',
        hsn1: product.hsn1 || '',
        moq: product.moq || '',
        piecesPerPack: product.piecesPerPack || '',
        fitShape: product.fitShape || '',
        neckType: product.neckType || '',
        occasion: product.occasion || '',
        pattern: product.pattern || '',
        sleeveLength: product.sleeveLength || '',
        shipsIn: product.shipsIn || '',
        mainImage: mainImageUrl || '',
        imageUrls: newImageUrls,
        imageUrlsJson: JSON.stringify(newImageUrls),
        variants: flattenedVariants,
        variantsJson: JSON.stringify(flattenedVariants),
        top: product.top === 'true' ? 'true' : 'false',
        trending: product.trending === 'true' ? 'true' : 'false'
      }
      
      // Validate required fields before sending
      if (!productData.name || productData.name.trim() === '') {
        setError('❌ Product name is required');
        return;
      }
      
      if (!productData.sellerId || productData.sellerId.trim() === '') {
        setError('❌ Seller ID is required');
        return;
      }
      
      console.log('Sending product data:', productData)
      console.log('Product data keys:', Object.keys(productData))
      console.log('Product data structure:', {
        id: productData.id,
        name: productData.name,
        category: productData.category,
        subcategory: productData.subcategory,
        variants: productData.variants,
        variantsJson: productData.variantsJson,
        sellerId: productData.sellerId
      })
      
      await api.product.update(id, productData)
      
      setSuccessMessage('✅ Product updated successfully!')
      
      // Navigate back to products list after a short delay
      setTimeout(() => {
        navigate('/products')
      }, 2000)
    } catch (err) {
      console.error('Error updating product:', err)
      
      // Extract detailed error information
      let errorMessage = 'Unknown error'
      if (err.response && err.response.data) {
        console.error('Full error response:', err.response.data)
        
        if (err.response.data.errors) {
          console.error('Validation errors:', err.response.data.errors)
          
          // Format validation errors for display
          const validationErrors = Object.entries(err.response.data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')
          
          errorMessage = `Validation errors: ${validationErrors}`
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(`❌ Failed to update product: ${errorMessage}`)
    } finally {
      setSaving(false)
      setImageUploading(false)
    }
  }

  // Function to toggle product field
  const toggleProductField = async (field) => {
    try {
      setSaving(true)
      setError(null)
      const newValue = product[field] === 'true' ? 'false' : 'true'
      
      // Flatten variants for API
      const flattenedVariants = product.variants.flatMap(variant => 
        variant.sizes.map(size => {
          const stockValue = parseInt(size.stock) || 0
          const priceValue = parseFloat(size.price) || 0
          
          console.log(`Processing variant: ${variant.color} ${size.size} - stock: ${size.stock} -> ${stockValue} (${typeof stockValue}), price: ${size.price} -> ${priceValue} (${typeof priceValue})`)
          
          return {
            id: uuidv4(),
            color: variant.color || '',
            size: size.size || '',
            weight: size.weight || '',
            stock: String(stockValue),  // Convert to string as backend expects
            price: priceValue   // Keep as number for price
          }
        })
      )

      // Validate flattened variants
      console.log('Flattened variants:', flattenedVariants)
      flattenedVariants.forEach((variant, index) => {
        console.log(`Variant ${index}:`, {
          ...variant,
          stockType: typeof variant.stock,
          priceType: typeof variant.price
        })
      })

      // Calculate total stock
      const totalStock = flattenedVariants.reduce((sum, variant) => {
        return sum + (parseInt(variant.stock) || 0)
      }, 0)

      // Find category and subcategory names from IDs
      const selectedCategory = categories.find(cat => cat.id === product.category)
      const selectedSubcategory = subcategories.find(subcat => subcat.id === product.subcategory)

      const updatedProduct = {
        id: id,
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        stock: totalStock,
        sellerId: product.sellerId || 'default-seller',
        status: product.status || 'In Review',
        category: selectedCategory ? selectedCategory.categoryName : (product.originalCategoryName || product.category || ''),
        subcategory: selectedSubcategory ? selectedSubcategory.subCategoryName : (product.originalSubcategoryName || product.subcategory || ''),
        brand: product.brand || '',
        material: product.material || '',
        gst: product.gst || '5%',
        hsn1: product.hsn1 || '',
        moq: product.moq || '',
        piecesPerPack: product.piecesPerPack || '',
        fitShape: product.fitShape || '',
        neckType: product.neckType || '',
        occasion: product.occasion || '',
        pattern: product.pattern || '',
        sleeveLength: product.sleeveLength || '',
        shipsIn: product.shipsIn || '',
        mainImage: product.mainImage || '',
        imageUrls: product.imageUrls,
        imageUrlsJson: JSON.stringify(product.imageUrls),
        variants: flattenedVariants,
        variantsJson: JSON.stringify(flattenedVariants),
        [field]: newValue,
        top: field === 'top' ? newValue : (product.top === 'true' ? 'true' : 'false'),
        trending: field === 'trending' ? newValue : (product.trending === 'true' ? 'true' : 'false')
      }
      
      await api.product.update(id, updatedProduct)
      setProduct(prev => ({ ...prev, [field]: newValue }))
      setSuccessMessage(`✅ Product ${newValue === 'true' ? 'marked as' : 'unmarked from'} ${field}`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error in toggleProductField:', err)
      
      // Extract detailed error information
      let errorMessage = 'Unknown error'
      if (err.response && err.response.data) {
        console.error('Full error response:', err.response.data)
        
        if (err.response.data.errors) {
          console.error('Validation errors:', err.response.data.errors)
          
          // Format validation errors for display
          const validationErrors = Object.entries(err.response.data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')
          
          errorMessage = `Validation errors: ${validationErrors}`
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(`❌ Failed to update product: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  // Remove image from URL list
  const handleRemoveImageUrl = (index) => {
    setProduct(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-700">Edit Product</h1>
            <button
              onClick={() => navigate('/products')}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Back to Products
            </button>
          </div>

          {/* Top and Trending Buttons */}
          <div className="flex justify-end space-x-4 mb-6">
            <button
              type="button"
              onClick={() => toggleProductField('top')}
              disabled={saving}
              className="inline-flex items-center rounded-md border border-transparent bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              {product.top === 'true' ? 'Unmark as Top' : 'Mark as Top'}
            </button>
            <button
              type="button"
              onClick={() => toggleProductField('trending')}
              disabled={saving}
              className="inline-flex items-center rounded-md border border-transparent bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {product.trending === 'true' ? 'Unmark as Trending' : 'Mark as Trending'}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className={`p-4 rounded-lg mb-4 text-center font-bold bg-red-100 text-red-800 border border-red-300`}>
              {error}
            </div>
          )}

          {successMessage && (
            <div className={`p-4 rounded-lg mb-4 text-center font-bold bg-green-100 text-green-800 border border-green-300`}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                <select
                  name="subcategory"
                  value={product.subcategory}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  disabled={!product.category || loadingSubcategories}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.subCategoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={product.name}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={product.status}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="In Review">In Review</option>
                  <option value="Draft">Draft</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={product.brand}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                />
              </div>
            </div>

            {/* GST & HSN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
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
            </div>

            {/* Product Variants */}
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
              {product.variants.length > 0 && (
                <div className="space-y-6">
                  {product.variants.map((variant, colorIndex) => (
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
                                      value={sizeVariant.weight || ''}
                                      onChange={(e) => handleVariantChange(colorIndex, sizeIndex, 'weight', e.target.value)}
                                      className="p-2 border rounded w-full"
                                      placeholder="Enter weight"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-gray-600">Stock</label>
                                    <input
                                      type="number"
                                      value={sizeVariant.stock || ''}
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
                                      value={sizeVariant.price || ''}
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

            {/* Other Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MOQ (packs)</label>
                  <input
                    type="text"
                    name="moq"
                    value={product.moq}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pieces per Pack</label>
                  <input
                    type="text"
                    name="piecesPerPack"
                    value={product.piecesPerPack}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <input
                    type="text"
                    name="material"
                    value={product.material}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fit Shape</label>
                  <input
                    type="text"
                    name="fitShape"
                    value={product.fitShape}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Neck Type</label>
                  <select
                    name="neckType"
                    value={product.neckType}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  >
                    <option value="">Select Neck Type</option>
                    <option value="Round Neck">Round Neck</option>
                    <option value="V-Neck">V-Neck</option>
                    <option value="Collar">Collar</option>
                    <option value="Boat Neck">Boat Neck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
                  <select
                    name="occasion"
                    value={product.occasion}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  >
                    <option value="">Select Occasion</option>
                    <option value="Casual">Casual</option>
                    <option value="Formal">Formal</option>
                    <option value="Party">Party</option>
                    <option value="Festive">Festive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
                  <select
                    name="pattern"
                    value={product.pattern}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  >
                    <option value="">Select Pattern</option>
                    <option value="Solid">Solid</option>
                    <option value="Striped">Striped</option>
                    <option value="Printed">Printed</option>
                    <option value="Checked">Checked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sleeve Length</label>
                  <select
                    name="sleeveLength"
                    value={product.sleeveLength}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
                  >
                    <option value="">Sleeve Length</option>
                    <option value="Sleeveless">Sleeveless</option>
                    <option value="Short Sleeve">Short Sleeve</option>
                    <option value="Half Sleeve">Half Sleeve</option>
                    <option value="Full Sleeve">Full Sleeve</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                rows={4}
                value={product.description}
                onChange={handleInputChange}
                className="p-3 rounded-lg bg-gray-100 w-full border border-gray-200"
              />
            </div>

            {/* Current Images */}
            {product.imageUrls.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Image Upload */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <label className="block text-gray-600 mb-2 font-semibold">Update Main Image</label>
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
                    alt="New Main Preview"
                    className="w-32 h-40 object-cover rounded shadow-md"
                  />
                </div>
              )}
              {product.mainImage && !mainImageFile && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={product.mainImage}
                    alt="Current Main"
                    className="w-32 h-40 object-cover rounded shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Additional Images Upload */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <label className="block text-gray-600 mb-2 font-semibold">Add More Images</label>
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
                      +{i + 1}
                    </span>
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`New Upload ${i + 1}`}
                      className="w-20 h-24 object-cover rounded border-2 border-gray-200 shadow-md"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || imageUploading}
                className={`inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 transition-all duration-300 ${(saving || imageUploading) ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {imageUploading ? 'Uploading Images...' : 'Saving...'}
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 