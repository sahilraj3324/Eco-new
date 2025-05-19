using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewRatingController : ControllerBase
    {
        private readonly EcoContext _context;

        public ReviewRatingController(EcoContext context)
        {
            _context = context;
        }

        // POST: api/ReviewRating
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] ReviewRating review)
        {
            review.Id = Guid.NewGuid();
            _context.ReviewRatings.Add(review);
            await _context.SaveChangesAsync();

            return Ok(review);
        }

        // GET: api/ReviewRating
        [HttpGet]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _context.ReviewRatings.ToListAsync();
            return Ok(reviews);
        }

        // GET: api/ReviewRating/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetReviewsByProduct(Guid productId)
        {
            var reviews = await _context.ReviewRatings
                .Where(r => r.ProductId == productId)
                .ToListAsync();

            return Ok(reviews);
        }

        // DELETE: api/ReviewRating/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(Guid id)
        {
            var review = await _context.ReviewRatings.FindAsync(id);
            if (review == null)
                return NotFound("Review not found.");

            _context.ReviewRatings.Remove(review);
            await _context.SaveChangesAsync();

            return Ok("Review deleted successfully.");
        }
    }
}
