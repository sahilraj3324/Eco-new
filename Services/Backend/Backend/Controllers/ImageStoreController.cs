using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageStoreController : ControllerBase
    {
        private readonly EcoContext _context;

        public ImageStoreController(EcoContext context)
        {
            _context = context;
        }

        // Get all images
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ImageStore>>> GetAllImages()
        {
            return await _context.ImageStores.ToListAsync();
        }

        // Get image by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ImageStore>> GetImageById(Guid id)
        {
            var imageStore = await _context.ImageStores.FindAsync(id);
            if (imageStore == null)
                return NotFound(new { message = "Image not found" });

            return imageStore;
        }

        // Add new images
        [HttpPost]
        public async Task<ActionResult<ImageStore>> AddImages([FromBody] ImageStore imageStore)
        {
            if (string.IsNullOrEmpty(imageStore.Image1) || string.IsNullOrEmpty(imageStore.Image2))
                return BadRequest(new { message = "Both images are required" });

            imageStore.CreatedAt = DateTime.UtcNow;
            _context.ImageStores.Add(imageStore);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetImageById), new { id = imageStore.Id }, imageStore);
        }

        // Update images
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateImages(Guid id, [FromBody] ImageStore updatedImageStore)
        {
            var imageStore = await _context.ImageStores.FindAsync(id);
            if (imageStore == null)
                return NotFound(new { message = "Image not found" });

            if (string.IsNullOrEmpty(updatedImageStore.Image1) || string.IsNullOrEmpty(updatedImageStore.Image2))
                return BadRequest(new { message = "Both images are required" });

            imageStore.Image1 = updatedImageStore.Image1;
            imageStore.Image2 = updatedImageStore.Image2;
            imageStore.Description = updatedImageStore.Description;
            imageStore.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Images updated successfully", imageStore });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error updating images", error = ex.Message });
            }
        }

        // Delete images
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImages(Guid id)
        {
            var imageStore = await _context.ImageStores.FindAsync(id);
            if (imageStore == null)
                return NotFound(new { message = "Image not found" });

            _context.ImageStores.Remove(imageStore);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Images deleted successfully" });
        }
    }
} 