using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly EcoContext _context;

        public WishlistController(EcoContext context)
        {
            _context = context;
        }

        // POST: api/Wishlist
        [HttpPost]
        public async Task<IActionResult> AddToWishlist([FromBody] WishlistItem item)
        {
            // 🛠 Prevent full Product from client
            item.Id = Guid.NewGuid();
            item.Product = null;
            item.AddedAt = DateTime.UtcNow;

            var exists = await _context.WishlistItems
                .AnyAsync(w => w.UserId == item.UserId && w.ProductId == item.ProductId);

            if (exists)
                return BadRequest("Product already in wishlist");

            _context.WishlistItems.Add(item);
            await _context.SaveChangesAsync();

            return Ok("Item added to wishlist");
        }

        // GET: api/Wishlist/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserWishlist(string userId)
        {
            var items = await _context.WishlistItems
                .Where(w => w.UserId == userId)
                .Include(w => w.Product)
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/Wishlist
        [HttpGet]
        public async Task<IActionResult> GetAllWishlistItems()
        {
            var wishlistItems = await _context.WishlistItems
                .Include(w => w.Product)
                .ToListAsync();

            return Ok(wishlistItems);
        }

        // DELETE: api/Wishlist/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFromWishlist(Guid id)
        {
            var item = await _context.WishlistItems.FindAsync(id);
            if (item == null) return NotFound("Wishlist item not found");

            _context.WishlistItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok("Item removed from wishlist");
        }
    }
}
