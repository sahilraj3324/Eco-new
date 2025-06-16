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
    public class BannerController : ControllerBase
    {
        private readonly EcoContext _context;

        public BannerController(EcoContext context)
        {
            _context = context;
        }

        // Get all banners
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Banner>>> GetAllBanners()
        {
            try
            {
                var banners = await _context.Banners.ToListAsync();
                return Ok(banners);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching banners", error = ex.Message });
            }
        }

        // Get banner by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Banner>> GetBannerById(Guid id)
        {
            try
            {
                var banner = await _context.Banners.FindAsync(id);
                if (banner == null)
                    return NotFound(new { message = "Banner not found" });

                return Ok(banner);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching banner", error = ex.Message });
            }
        }

        // Post all images (create banner with both image arrays)
        [HttpPost("all")]
        public async Task<ActionResult<Banner>> CreateBannerWithAllImages([FromBody] CreateBannerRequest request)
        {
            try
            {
                if ((request.Image1 == null || request.Image1.Count == 0) && 
                    (request.Image2 == null || request.Image2.Count == 0))
                    return BadRequest(new { message = "At least one image array must have images" });

                var banner = new Banner
                {
                    Image1 = request.Image1 ?? new List<string>(),
                    Image2 = request.Image2 ?? new List<string>(),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Banners.Add(banner);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetBannerById), new { id = banner.Id }, banner);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating banner", error = ex.Message });
            }
        }

        // Post only one image (create banner with single image array)
        [HttpPost("single")]
        public async Task<ActionResult<Banner>> CreateBannerWithSingleImage([FromBody] CreateSingleImageRequest request)
        {
            try
            {
                if (request.Images == null || request.Images.Count == 0)
                    return BadRequest(new { message = "Images array is required" });

                if (request.ImageField != "image1" && request.ImageField != "image2")
                    return BadRequest(new { message = "ImageField must be 'image1' or 'image2'" });

                var banner = new Banner
                {
                    Image1 = request.ImageField == "image1" ? request.Images : new List<string>(),
                    Image2 = request.ImageField == "image2" ? request.Images : new List<string>(),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Banners.Add(banner);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetBannerById), new { id = banner.Id }, banner);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating banner with single image", error = ex.Message });
            }
        }

        // Put single image array (update entire image array)
        [HttpPut("{id}/images/{imageField}")]
        public async Task<IActionResult> UpdateImageArray(Guid id, string imageField, [FromBody] UpdateImageArrayRequest request)
        {
            try
            {
                var banner = await _context.Banners.FindAsync(id);
                if (banner == null)
                    return NotFound(new { message = "Banner not found" });

                if (request.Images == null)
                    return BadRequest(new { message = "Images array is required" });

                if (imageField != "image1" && imageField != "image2")
                    return BadRequest(new { message = "ImageField must be 'image1' or 'image2'" });

                if (imageField == "image1")
                    banner.Image1 = request.Images;
                else
                    banner.Image2 = request.Images;

                banner.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Image array updated successfully", banner });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating image array", error = ex.Message });
            }
        }

        // Add images to existing image array
        [HttpPost("{id}/add-images/{imageField}")]
        public async Task<IActionResult> AddImagesToArray(Guid id, string imageField, [FromBody] UpdateImageArrayRequest request)
        {
            try
            {
                var banner = await _context.Banners.FindAsync(id);
                if (banner == null)
                    return NotFound(new { message = "Banner not found" });

                if (request.Images == null || request.Images.Count == 0)
                    return BadRequest(new { message = "Images array is required" });

                if (imageField != "image1" && imageField != "image2")
                    return BadRequest(new { message = "ImageField must be 'image1' or 'image2'" });

                if (imageField == "image1")
                    banner.Image1.AddRange(request.Images);
                else
                    banner.Image2.AddRange(request.Images);

                banner.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Images added successfully", banner });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error adding images", error = ex.Message });
            }
        }

        // Delete specific image from array
        [HttpDelete("{id}/images/{imageField}/{imageIndex}")]
        public async Task<IActionResult> DeleteImageFromArray(Guid id, string imageField, int imageIndex)
        {
            try
            {
                var banner = await _context.Banners.FindAsync(id);
                if (banner == null)
                    return NotFound(new { message = "Banner not found" });

                if (imageField != "image1" && imageField != "image2")
                    return BadRequest(new { message = "ImageField must be 'image1' or 'image2'" });

                var targetArray = imageField == "image1" ? banner.Image1 : banner.Image2;

                if (imageIndex < 0 || imageIndex >= targetArray.Count)
                    return BadRequest(new { message = "Invalid image index" });

                targetArray.RemoveAt(imageIndex);
                banner.UpdatedAt = DateTime.UtcNow;

                // If both arrays are empty, delete the banner
                if (banner.Image1.Count == 0 && banner.Image2.Count == 0)
                {
                    _context.Banners.Remove(banner);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Banner deleted as no images remain" });
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Image deleted successfully", banner });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting image", error = ex.Message });
            }
        }

        // Delete all banners
        [HttpDelete("all")]
        public async Task<IActionResult> DeleteAllBanners()
        {
            try
            {
                var banners = await _context.Banners.ToListAsync();
                _context.Banners.RemoveRange(banners);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Deleted {banners.Count} banners successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting all banners", error = ex.Message });
            }
        }

        // Delete single banner
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBanner(Guid id)
        {
            try
            {
                var banner = await _context.Banners.FindAsync(id);
                if (banner == null)
                    return NotFound(new { message = "Banner not found" });

                _context.Banners.Remove(banner);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Banner deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting banner", error = ex.Message });
            }
        }
    }

    // Request models
    public class CreateBannerRequest
    {
        public List<string>? Image1 { get; set; }
        public List<string>? Image2 { get; set; }
    }

    public class CreateSingleImageRequest
    {
        public List<string> Images { get; set; } = new List<string>();
        public string ImageField { get; set; } = string.Empty; // "image1" or "image2"
    }

    public class UpdateImageArrayRequest
    {
        public List<string> Images { get; set; } = new List<string>();
    }
} 