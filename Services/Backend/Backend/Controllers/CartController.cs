using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            // 🛠 Important fix: ignore any Product object coming from client
            item.Id = Guid.NewGuid();
            item.Product = null;
            item.AddedAt = DateTime.UtcNow;

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == item.UserId && c.ProductId == item.ProductId);

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

            return Ok(items);
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
    }
}
