# 📊 Bulk Product Upload - CSV Format Guide

## 📁 Files Provided:
- **`bulk_upload_template.csv`** - Ready-to-use template with sample data
- **`CSV_Upload_Instructions.md`** - This instruction file

## 🎯 CSV Column Requirements

### 📋 **Required Columns** (20 total):

| Column | Description | Type | Example | Required |
|--------|-------------|------|---------|----------|
| **name** | Product name | Text | "Cotton T-Shirt" | ✅ Yes |
| **description** | Product description | Text | "Comfortable cotton t-shirt" | ✅ Yes |
| **price** | Base price | Number | 599 | ✅ Yes |
| **stock** | Total stock (auto-calculated from variants) | Number | 100 | ✅ Yes |
| **category** | Product category | Text | "Men's Clothing" | ✅ Yes |
| **subcategory** | Product subcategory | Text | "T-Shirts" | ✅ Yes |
| **brand** | Brand name | Text | "Brand A" | ✅ Yes |
| **material** | Fabric/material type | Text | "Cotton" | ✅ Yes |
| **gst** | GST percentage | Text | "5%" or "12%" | ✅ Yes |
| **hsn1** | HSN code | Text | "6109" | ✅ Yes |
| **moq** | Minimum order quantity (packs) | Text | "10" | ✅ Yes |
| **piecesPerPack** | Pieces per pack | Text | "5" | ✅ Yes |
| **fitShape** | Fit/shape description | Text | "Regular Fit" | ✅ Yes |
| **neckType** | Neck type | Text | "Round Neck" | ✅ Yes |
| **occasion** | Occasion type | Text | "Casual" | ✅ Yes |
| **pattern** | Pattern type | Text | "Solid" | ✅ Yes |
| **sleeveLength** | Sleeve length | Text | "Short Sleeve" | ✅ Yes |
| **shipsIn** | Shipping days | Text | "2" | ✅ Yes |
| **minOrderQuantity** | Minimum order quantity | Text | "5" | ✅ Yes |
| **variants** | Product variants (special format) | Text | See format below | ✅ Yes |

## 🎨 **Variants Format** (Most Important!)

The `variants` column uses a special format: **`size,color,weight,stock,price`**

### 📝 **Single Variant Format:**
```
S,Red,0.2,20,550
```
- **S** = Size
- **Red** = Color  
- **0.2** = Weight (kg)
- **20** = Stock quantity
- **550** = Price

### 🔗 **Multiple Variants Format:**
Use **`|`** (pipe) to separate multiple variants:
```
S,Red,0.2,20,550|M,Red,0.2,25,550|L,Red,0.2,15,550|S,Blue,0.2,18,550
```

## 🎯 **Field Guidelines:**

### **Categories & Subcategories:**
- **Men's Clothing:** T-Shirts, Shirts, Jeans, Trousers
- **Women's Clothing:** Kurtis, Dresses, Tops, Sarees
- **Kids Clothing:** T-Shirts, Shirts, Shorts, Dresses

### **GST Options:**
- `5%` - For basic clothing
- `12%` - For premium items

### **HSN Codes:**
- `6109` - T-shirts, tank tops
- `6204` - Women's garments
- `6110` - Sweaters, cardigans
- `6203` - Men's trousers, jeans
- `6403` - Footwear

### **Neck Types:**
- Round Neck, V-Neck, Collar, Boat Neck

### **Occasions:**
- Casual, Formal, Party, Festive

### **Patterns:**
- Solid, Striped, Printed, Checked

### **Sleeve Lengths:**
- Sleeveless, Short Sleeve, Half Sleeve, Full Sleeve, N/A

### **Fit Shapes:**
- Regular Fit, Slim Fit, Loose Fit, A-Line, Straight Fit

## 📊 **Sample Data Breakdown:**

### Example Product 1: Cotton T-Shirt
```csv
Cotton T-Shirt,Comfortable cotton t-shirt for daily wear,599,100,Men's Clothing,T-Shirts,Brand A,Cotton,5%,6109,10,5,Regular Fit,Round Neck,Casual,Solid,Short Sleeve,2,5,"S,Red,0.2,20,550|M,Red,0.2,25,550|L,Red,0.2,15,550|S,Blue,0.2,18,550|M,Blue,0.2,22,550|L,Blue,0.2,12,550"
```

**Variants Breakdown:**
- Small Red: 20 pieces at ₹550 each
- Medium Red: 25 pieces at ₹550 each  
- Large Red: 15 pieces at ₹550 each
- Small Blue: 18 pieces at ₹550 each
- Medium Blue: 22 pieces at ₹550 each
- Large Blue: 12 pieces at ₹550 each

## ⚠️ **Important Notes:**

### 🚨 **Critical Rules:**
1. **No commas inside field values** (except in variants column)
2. **Wrap the variants column in quotes** if it contains commas
3. **Use pipe `|` to separate variants**, not commas
4. **Each variant must have exactly 5 values:** `size,color,weight,stock,price`
5. **All fields are required** - use "N/A" for non-applicable fields

### 📐 **Data Format Requirements:**
- **Prices:** Numbers only (599, not ₹599)
- **Stock:** Whole numbers only
- **Weight:** Decimal allowed (0.2, 1.5)
- **GST:** Include % symbol (5%, 12%)
- **Text fields:** No special characters except hyphens and spaces

### 🎯 **Validation:**
- File size: Max 8 MB
- Products: Up to 50 per upload
- Format: CSV only
- Encoding: UTF-8 recommended

## 🚀 **Upload Process:**

1. **📝 Fill the CSV** using the template
2. **📂 Upload CSV** in the bulk upload interface
3. **🖼️ Add images** for each product after CSV is parsed
4. **✅ Review** the product preview
5. **🚀 Upload** to add all products

## ✅ **Success Tips:**

- **Start with the template** and modify it
- **Test with 1-2 products** first
- **Keep variant data simple** initially
- **Use consistent naming** for categories/brands
- **Verify all required fields** are filled

## 🆘 **Common Issues:**

❌ **"CSV parsing failed"** → Check for extra commas in fields  
❌ **"Missing required fields"** → Ensure all 20 columns are present  
❌ **"Invalid variants format"** → Check pipe separators and 5-value format  
❌ **"Image upload failed"** → Add images after CSV is successfully parsed  

---

**📞 Need Help?** Check the sample data in `bulk_upload_template.csv` for reference! 