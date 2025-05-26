using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly EcoContext _context;

        public CartController(EcoContext context)
        {
            _context = context;
        }

        // POST: api/Cart
        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] CartItem item)
        {
            // Validate that the product exists
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product == null)
            {
                return BadRequest("Product not found");
            }

            // Validate that the variant exists within the product
            if (!await IsValidVariant(item.ProductId, item.VariantId))
            {
                return BadRequest("Invalid variant for this product");
            }

            // 🛠 Important fix: ignore any Product object coming from client
            item.Id = Guid.NewGuid();
            item.Product = null;
            item.AddedAt = DateTime.UtcNow;

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == item.UserId && 
                                       c.ProductId == item.ProductId && 
                                       c.VariantId == item.VariantId);

            if (existingItem != null)
            {
                existingItem.Quantity += item.Quantity;
            }
            else
            {
                _context.CartItems.Add(item);
            }

            await _context.SaveChangesAsync();
            return Ok("Item added to cart");
        }

        // GET: api/Cart/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserCart(string userId)
        {
            var items = await _context.CartItems
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();

            // Enrich cart items with variant details
            var enrichedItems = items.Select(item => new
            {
                item.Id,
                item.UserId,
                item.ProductId,
                item.VariantId,
                item.Quantity,
                item.AddedAt,
                Product = item.Product,
                Variant = GetVariantDetails(item.Product, item.VariantId)
            }).ToList();

            return Ok(enrichedItems);
        }

        // GET: api/Cart
        [HttpGet]
        public async Task<IActionResult> GetAllCartItems()
        {
            var cartItems = await _context.CartItems
                .Include(c => c.Product)
                .ToListAsync();

            return Ok(cartItems);
        }

        // PUT: api/Cart/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuantity(Guid id, [FromBody] int quantity)
        {
            var item = await _context.CartItems.FindAsync(id);
            if (item == null) return NotFound("Cart item not found");

            item.Quantity = quantity;
            await _context.SaveChangesAsync();

            return Ok("Quantity updated");
        }

        // DELETE: api/Cart/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFromCart(Guid id)
        {
            var item = await _context.CartItems.FindAsync(id);
            if (item == null) return NotFound("Cart item not found");

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok("Item removed from cart");
        }

        // Helper method to validate if variant exists within a product
        private async Task<bool> IsValidVariant(Guid productId, Guid variantId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return false;

            try
            {
                if (string.IsNullOrWhiteSpace(product.VariantsJson))
                    return false;

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var variants = JsonSerializer.Deserialize<List<ProductVariant>>(product.VariantsJson, options);
                
                return variants?.Any(v => v.Id == variantId) ?? false;
            }
            catch
            {
                return false; // If JSON is corrupted, consider variant invalid
            }
        }

        // Helper method to get variant details
        private ProductVariant GetVariantDetails(Product product, Guid variantId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(product.VariantsJson))
                    return null;

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var variants = JsonSerializer.Deserialize<List<ProductVariant>>(product.VariantsJson, options);
                
                return variants?.FirstOrDefault(v => v.Id == variantId);
            }
            catch
            {
                return null;
            }
        }
    }
}
