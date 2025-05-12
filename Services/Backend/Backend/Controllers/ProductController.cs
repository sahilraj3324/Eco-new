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

            // Update variants
            existingProduct.Variants = updatedProduct.Variants;
            existingProduct.VariantsJson = JsonSerializer.Serialize(updatedProduct.Variants);

            if (!TryValidateModel(existingProduct))
                return BadRequest(ModelState);

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
            var allProducts = await _context.Products.ToListAsync();

            if (!allProducts.Any())
                return NotFound(new { message = "No products found to delete." });

            _context.Products.RemoveRange(allProducts);
            await _context.SaveChangesAsync();

            return Ok(new { message = "All products deleted successfully!", deletedCount = allProducts.Count });
        }
    }
}
