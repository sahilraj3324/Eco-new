using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubCategoryController : ControllerBase
    {
        private readonly EcoContext _context;

        public SubCategoryController(EcoContext context)
        {
            _context = context;
        }

        // POST: api/SubCategory
        [HttpPost]
        public async Task<IActionResult> CreateSubCategory([FromBody] SubCategory subCategory)
        {
            if (!await _context.Categories.AnyAsync(c => c.Id == subCategory.CategoryId))
                return NotFound("Category not found");

            subCategory.Id = Guid.NewGuid();
            _context.SubCategories.Add(subCategory);
            await _context.SaveChangesAsync();

            return Ok(subCategory);
        }

        // GET: api/SubCategory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubCategory>>> GetAllSubCategories()
        {
            return await _context.SubCategories.ToListAsync();
        }

        // GET: api/SubCategory/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubCategory(Guid id)
        {
            var subCategory = await _context.SubCategories.FindAsync(id);

            if (subCategory == null)
                return NotFound("SubCategory not found");

            return Ok(subCategory);
        }

        // PUT: api/SubCategory/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubCategory(Guid id, [FromBody] SubCategory request)
        {
            var subCategory = await _context.SubCategories.FindAsync(id);
            if (subCategory == null)
                return NotFound("SubCategory not found");

            subCategory.SubCategoryName = request.SubCategoryName ?? subCategory.SubCategoryName;
            subCategory.CategoryId = request.CategoryId;

            await _context.SaveChangesAsync();

            return Ok(subCategory);
        }

        // GET: api/SubCategory/by-category/{categoryId}
        [HttpGet("by-category/{categoryId}")]
        public async Task<IActionResult> GetSubCategoriesByCategory(Guid categoryId)
        {
            var subCategories = await _context.SubCategories
                .Where(sc => sc.CategoryId == categoryId)
                .ToListAsync();

            if (subCategories.Count == 0)
                return NotFound("No subcategories found for the given category");

            return Ok(subCategories);
        }


        // DELETE: api/SubCategory/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubCategory(Guid id)
        {
            var subCategory = await _context.SubCategories.FindAsync(id);
            if (subCategory == null)
                return NotFound("SubCategory not found");

            _context.SubCategories.Remove(subCategory);
            await _context.SaveChangesAsync();

            return Ok("SubCategory deleted successfully");
        }
    }
}
