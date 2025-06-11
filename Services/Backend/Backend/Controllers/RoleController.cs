using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly EcoContext _context;

        public RoleController(EcoContext context)
        {
            _context = context;
        }

        // GET: api/Role
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            try
            {
                var roles = await _context.CustomRoles.OrderBy(r => r.Name).ToListAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching roles", error = ex.Message });
            }
        }

        // GET: api/Role/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRole(Guid id)
        {
            try
            {
                var role = await _context.CustomRoles.FindAsync(id);
                if (role == null)
                {
                    return NotFound(new { message = "Role not found" });
                }

                return Ok(role);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching role", error = ex.Message });
            }
        }

        // POST: api/Role
        [HttpPost]
        public async Task<ActionResult<Role>> CreateRole(Role role)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if role name already exists
                var existingRole = await _context.CustomRoles.FirstOrDefaultAsync(r => r.Name.ToLower() == role.Name.ToLower());
                if (existingRole != null)
                {
                    return BadRequest(new { message = "Role name already exists" });
                }

                role.Id = Guid.NewGuid();
                role.CreatedAt = DateTime.UtcNow;
                role.UpdatedAt = DateTime.UtcNow;

                _context.CustomRoles.Add(role);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating role", error = ex.Message });
            }
        }

        // PUT: api/Role/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(Guid id, Role role)
        {
            try
            {
                if (id != role.Id)
                {
                    return BadRequest(new { message = "Role ID mismatch" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingRole = await _context.CustomRoles.FindAsync(id);
                if (existingRole == null)
                {
                    return NotFound(new { message = "Role not found" });
                }

                // Check if role name already exists (excluding current role)
                var duplicateRole = await _context.CustomRoles.FirstOrDefaultAsync(r => r.Name.ToLower() == role.Name.ToLower() && r.Id != id);
                if (duplicateRole != null)
                {
                    return BadRequest(new { message = "Role name already exists" });
                }

                existingRole.Name = role.Name;
                existingRole.Tabs = role.Tabs;
                existingRole.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(existingRole);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating role", error = ex.Message });
            }
        }

        // DELETE: api/Role/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            try
            {
                var role = await _context.CustomRoles.FindAsync(id);
                if (role == null)
                {
                    return NotFound(new { message = "Role not found" });
                }

                // Check if any SubAdmins are using this role
                var subAdminsWithRole = await _context.SubAdmins
                    .Where(sa => sa.Roles.Contains(role.Id.ToString()))
                    .ToListAsync();

                if (subAdminsWithRole.Any())
                {
                    return BadRequest(new { message = "Cannot delete role. It is assigned to one or more SubAdmins." });
                }

                _context.CustomRoles.Remove(role);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting role", error = ex.Message });
            }
        }

        // PUT: api/Role/{id}/tabs
        [HttpPut("{id}/tabs")]
        public async Task<IActionResult> UpdateRoleTabs(Guid id, [FromBody] List<string> tabs)
        {
            try
            {
                var role = await _context.CustomRoles.FindAsync(id);
                if (role == null)
                {
                    return NotFound(new { message = "Role not found" });
                }

                role.Tabs = tabs ?? new List<string>();
                role.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(role);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating role tabs", error = ex.Message });
            }
        }

        // GET: api/Role/available-tabs
        [HttpGet("available-tabs")]
        public ActionResult<IEnumerable<object>> GetAvailableTabs()
        {
            try
            {
                var availableTabs = new List<object>
                {
                    new { value = "dashboard", name = "Dashboard", description = "View system overview and analytics" },
                    new { value = "vendors", name = "Vendors", description = "Manage vendors and their profiles" },
                    new { value = "products", name = "Products", description = "Manage products and inventory" },
                    new { value = "categories", name = "Categories", description = "Manage product categories and subcategories" },
                    new { value = "retailers", name = "Retailers", description = "Manage retailer accounts and profiles" },
                    new { value = "orders", name = "Orders", description = "View and manage customer orders" },
                    new { value = "asks", name = "Asks", description = "Handle customer questions and support requests" },
                    new { value = "roles", name = "Roles", description = "Manage user roles and permissions (Admin only)" },
                    new { value = "admins", name = "Admins", description = "Manage admin and sub-admin accounts (Admin only)" }
                };

                return Ok(availableTabs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching available tabs", error = ex.Message });
            }
        }
    }
} 