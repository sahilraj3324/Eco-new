using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text.Json;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly EcoContext _context;

        public ProductController(EcoContext context)
        {
            _context = context;
        }

        // Get all products
        [HttpGet("get-all")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // Get products by seller
        [HttpGet("get-by-seller/{sellerId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsBySeller(string sellerId)
        {
            var products = await _context.Products
                                         .Where(p => p.SellerId == sellerId)
                                         .ToListAsync();

            if (!products.Any())
                return NotFound(new { message = "No products found for this seller." });

            return Ok(products);
        }

        // Get product by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            return product;
        }

        // Add a new single product
        [HttpPost("add")]
        public async Task<IActionResult> AddSingleProduct([FromBody] Product product)
        {
            if (product == null)
                return BadRequest("Invalid product data.");

            if (!TryValidateModel(product))
                return BadRequest(ModelState);

            product.Id = Guid.NewGuid();
            product.VariantsJson = JsonSerializer.Serialize(product.Variants);
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Single product added successfully!", productId = product.Id });
        }

        // Add bulk products
        [HttpPost("add/bulk")]
        public async Task<IActionResult> AddBulkProducts([FromBody] List<Product> products)
        {
            if (products == null || !products.Any())
                return BadRequest("No products provided.");

            foreach (var product in products)
            {
                if (!TryValidateModel(product))
                    return BadRequest(ModelState);

                product.Id = Guid.NewGuid();
                product.VariantsJson = JsonSerializer.Serialize(product.Variants);
            }

            _context.Products.AddRange(products);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bulk products added successfully!", count = products.Count });
        }

        // Update product
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] Product updatedProduct)
        {
            if (updatedProduct == null || id != updatedProduct.Id)
                return BadRequest("Product data is invalid or IDs do not match.");

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
                return NotFound(new { message = "Product not found." });

            // Validate required fields
            if (string.IsNullOrWhiteSpace(updatedProduct.Name))
                return BadRequest(new { message = "Product name is required." });
            
            if (updatedProduct.Price < 0)
                return BadRequest(new { message = "Product price must be greater than or equal to 0." });
            
            if (updatedProduct.Stock < 0)
                return BadRequest(new { message = "Product stock must be greater than or equal to 0." });

            // If SellerId is empty, keep the existing one
            if (string.IsNullOrWhiteSpace(updatedProduct.SellerId))
                updatedProduct.SellerId = existingProduct.SellerId;

            // Update fields
            existingProduct.Name = updatedProduct.Name;
            existingProduct.Description = updatedProduct.Description;
            existingProduct.Price = updatedProduct.Price;
            existingProduct.Stock = updatedProduct.Stock;
            existingProduct.SellerId = updatedProduct.SellerId;
            existingProduct.Status = updatedProduct.Status;
            existingProduct.Category = updatedProduct.Category;
            existingProduct.Brand = updatedProduct.Brand;
            existingProduct.Material = updatedProduct.Material;
            existingProduct.ImageUrls = updatedProduct.ImageUrls;
            existingProduct.Subcategory = updatedProduct.Subcategory;
            existingProduct.Gst = updatedProduct.Gst;
            existingProduct.Hsn1 = updatedProduct.Hsn1;
            existingProduct.MOQ = updatedProduct.MOQ;
            existingProduct.PiecesPerPack = updatedProduct.PiecesPerPack;
            existingProduct.FitShape = updatedProduct.FitShape;
            existingProduct.NeckType = updatedProduct.NeckType;
            existingProduct.Occasion = updatedProduct.Occasion;
            existingProduct.Pattern = updatedProduct.Pattern;
            existingProduct.SleeveLength = updatedProduct.SleeveLength;
            existingProduct.ShipsIn = updatedProduct.ShipsIn;
            existingProduct.MainImage = updatedProduct.MainImage;
            existingProduct.Top = updatedProduct.Top;
            existingProduct.Trending = updatedProduct.Trending;

            // Update variants
            existingProduct.Variants = updatedProduct.Variants;
            existingProduct.VariantsJson = JsonSerializer.Serialize(updatedProduct.Variants);

            if (!TryValidateModel(existingProduct))
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .Select(x => new { 
                        Field = x.Key, 
                        Errors = x.Value.Errors.Select(e => e.ErrorMessage) 
                    });
                return BadRequest(new { message = "Validation failed", errors = errors });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Product updated successfully!", product = existingProduct });
        }

        // Delete product by ID
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Product deleted successfully!" });
        }

        // Delete all products
        [HttpDelete("delete-all")]
        public async Task<IActionResult> DeleteAllProducts()
        {
            try
            {
                // First, delete all related data
                var cartItems = await _context.CartItems.ToListAsync();
                var wishlistItems = await _context.WishlistItems.ToListAsync();
                var orders = await _context.Orders.ToListAsync();
                var reviewRatings = await _context.ReviewRatings.ToListAsync();

                // Remove related data
                _context.CartItems.RemoveRange(cartItems);
                _context.WishlistItems.RemoveRange(wishlistItems);
                _context.Orders.RemoveRange(orders);
                _context.ReviewRatings.RemoveRange(reviewRatings);

                // Get all products
                var allProducts = await _context.Products.ToListAsync();
                if (!allProducts.Any())
                    return NotFound(new { message = "No products found to delete." });

                // Remove all products
                _context.Products.RemoveRange(allProducts);
                
                // Save all changes
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "All products and related data deleted successfully!", 
                    deletedCount = allProducts.Count,
                    deletedRelatedItems = new {
                        cartItems = cartItems.Count,
                        wishlistItems = wishlistItems.Count,
                        orders = orders.Count,
                        reviews = reviewRatings.Count
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    message = "Error occurred while deleting products.", 
                    error = ex.Message 
                });
            }
        }

        // Update variant stock by variant ID
        [HttpPut("update-variant-stock/{productId}/{variantId}")]
        public async Task<IActionResult> UpdateVariantStock(Guid productId, Guid variantId, [FromBody] UpdateVariantStockRequest request)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return NotFound(new { message = "Product not found." });

            var variants = product.Variants;
            var variant = variants.FirstOrDefault(v => v.Id == variantId);

            if (variant == null)
                return NotFound(new { message = "Variant not found." });

            // Update the stock
            variant.Stock = request.NewStock.ToString();

            // Update the variants list and save to JSON
            product.Variants = variants;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { 
                    message = "Variant stock updated successfully.",
                    variant = variant
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to update variant stock.", error = ex.Message });
            }
        }

        // Update variant price by variant ID
        [HttpPut("update-variant-price/{productId}/{variantId}")]
        public async Task<IActionResult> UpdateVariantPrice(Guid productId, Guid variantId, [FromBody] UpdateVariantPriceRequest request)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return NotFound(new { message = "Product not found." });

            var variants = product.Variants;
            var variant = variants.FirstOrDefault(v => v.Id == variantId);

            if (variant == null)
                return NotFound(new { message = "Variant not found." });

            // Update the price
            variant.Price = request.NewPrice;

            // Update the variants list and save to JSON
            product.Variants = variants;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { 
                    message = "Variant price updated successfully.",
                    variant = variant
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to update variant price.", error = ex.Message });
            }
        }
    }

    public class UpdateVariantStockRequest
    {
        public int NewStock { get; set; }
    }

    public class UpdateVariantPriceRequest
    {
        public decimal NewPrice { get; set; }
    }
}
