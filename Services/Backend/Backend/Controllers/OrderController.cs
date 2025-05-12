using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

            if (product.Stock < order.Quantity)
                return BadRequest("Insufficient stock");

            // 🛠️ Fixes:
            order.Id = Guid.NewGuid(); // Always generate new Order ID
            order.Product = null;      // Prevent trying to insert Product again
            order.SellerId = product.SellerId;
            order.UnitPrice = product.Price;
            order.OrderDate = DateTime.UtcNow;
            order.Status = "Pending";

            product.Stock -= order.Quantity;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }



        // GET: api/Order/buyer/{buyerId}
        [HttpGet("buyer/{buyerId}")]
        public async Task<IActionResult> GetOrdersByBuyer(string buyerId)
        {
            var orders = await _context.Orders
                .Where(o => o.BuyerId == buyerId)
                .Include(o => o.Product)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/Order/seller/{sellerId}
        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetOrdersBySeller(string sellerId)
        {
            var orders = await _context.Orders
                .Where(o => o.SellerId == sellerId)
                .Include(o => o.Product)
                .ToListAsync();

            return Ok(orders);
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
    }
}
