using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly EcoContext _context;

        public OrderController(EcoContext context)
        {
            _context = context;
        }

        // POST: api/Order
        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] Order order)
        {
            var product = await _context.Products.FindAsync(order.ProductId);
            if (product == null)
                return NotFound("Product not found");

            // Validate that the variant exists within the product
            if (!await IsValidVariant(order.ProductId, order.VariantId))
            {
                return BadRequest("Invalid variant for this product");
            }

            // Get variant details for pricing and stock validation
            var variant = GetVariantDetails(product, order.VariantId);
            if (variant == null)
            {
                return BadRequest("Variant details not found");
            }

            // Check variant stock instead of product stock
            if (int.TryParse(variant.Stock, out int variantStock))
            {
                if (variantStock < order.Quantity)
                    return BadRequest("Insufficient variant stock");
            }
            else
            {
                // Fallback to product stock if variant stock is not a valid number
                if (product.Stock < order.Quantity)
                    return BadRequest("Insufficient stock");
            }

            // 🛠️ Fixes:
            order.Id = Guid.NewGuid(); // Always generate new Order ID
            order.Product = null;      // Prevent trying to insert Product again
            order.SellerId = product.SellerId;
            order.UnitPrice = variant.Price; // Use variant price instead of product price
            order.OrderDate = DateTime.UtcNow;
            order.Status = "Pending";

            // Update variant stock if it's a valid number
            if (int.TryParse(variant.Stock, out variantStock))
            {
                variant.Stock = (variantStock - order.Quantity).ToString();
                // Update the product's variants JSON
                product.Variants = product.Variants; // This will trigger the setter to update VariantsJson
            }
            else
            {
                // Fallback to updating product stock
                product.Stock -= order.Quantity;
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Product)
                .ToListAsync();

            // Enrich orders with variant details
            var enrichedOrders = orders.Select(order => new
            {
                order.Id,
                order.BuyerId,
                order.ProductId,
                order.VariantId,
                order.Quantity,
                order.UnitPrice,
                order.SellerId,
                order.Status,
                order.OrderDate,
                order.ProcessedAt,
                order.ShippingAddress,
                Product = order.Product,
                Variant = GetVariantDetails(order.Product, order.VariantId)
            }).ToList();

            return Ok(enrichedOrders);
        }

        // GET: api/Order/buyer/{buyerId}
        [HttpGet("buyer/{buyerId}")]
        public async Task<IActionResult> GetOrdersByBuyer(string buyerId)
        {
            var orders = await _context.Orders
                .Where(o => o.BuyerId == buyerId)
                .Include(o => o.Product)
                .ToListAsync();

            // Enrich orders with variant details
            var enrichedOrders = orders.Select(order => new
            {
                order.Id,
                order.BuyerId,
                order.ProductId,
                order.VariantId,
                order.Quantity,
                order.UnitPrice,
                order.SellerId,
                order.Status,
                order.OrderDate,
                order.ProcessedAt,
                order.ShippingAddress,
                Product = order.Product,
                Variant = GetVariantDetails(order.Product, order.VariantId)
            }).ToList();

            return Ok(enrichedOrders);
        }

        // GET: api/Order/seller/{sellerId}
        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetOrdersBySeller(string sellerId)
        {
            var orders = await _context.Orders
                .Where(o => o.SellerId == sellerId)
                .Include(o => o.Product)
                .ToListAsync();

            // Enrich orders with variant details
            var enrichedOrders = orders.Select(order => new
            {
                order.Id,
                order.BuyerId,
                order.ProductId,
                order.VariantId,
                order.Quantity,
                order.UnitPrice,
                order.SellerId,
                order.Status,
                order.OrderDate,
                order.ProcessedAt,
                order.ShippingAddress,
                Product = order.Product,
                Variant = GetVariantDetails(order.Product, order.VariantId)
            }).ToList();

            return Ok(enrichedOrders);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] string newStatus)
        {
            if (string.IsNullOrWhiteSpace(newStatus))
                return BadRequest("Status is required.");

            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound("Order not found.");

            var validStatuses = new[] { "Pending", "Processed", "Shipped", "Delivered", "Cancelled" };
            if (!validStatuses.Contains(newStatus))
                return BadRequest("Invalid status.");

            order.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully.", status = newStatus });
        }

        [HttpDelete("seller/{sellerId}/all")]
        public async Task<IActionResult> DeleteAllOrdersBySeller(string sellerId)
        {
            var orders = await _context.Orders
                .Where(o => o.SellerId == sellerId)
                .ToListAsync();

            if (orders.Count == 0)
                return NotFound("No orders found for the specified seller.");

            _context.Orders.RemoveRange(orders);
            await _context.SaveChangesAsync();

            return Ok("All orders for the seller have been deleted.");
        }

        [HttpDelete("all")]
        public async Task<IActionResult> DeleteAllOrders()
        {
            var orders = await _context.Orders.ToListAsync();

            if (orders.Count == 0)
                return NotFound("No orders found.");

            _context.Orders.RemoveRange(orders);
            await _context.SaveChangesAsync();

            return Ok("All orders have been deleted.");
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
