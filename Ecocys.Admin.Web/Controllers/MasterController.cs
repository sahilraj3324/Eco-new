using Dapper;
using Ecocys.Admin.Core;
using Ecocys.Admin.Core.Master;
using Ecocys.Admin.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace Ecocys.Admin.Web.Controllers;

public class MasterController : Controller
{
    private readonly IDapperService _dapper;
    private readonly EFDatabaseContext _dbContext;
    private readonly ILogger<MasterController> _logger;
    private readonly IWebHostEnvironment _environment;
    public MasterController(ILogger<MasterController> logger, IDapperService dapper, EFDatabaseContext dbContext, IWebHostEnvironment environment)
    {
        _logger = logger;
        _dapper = dapper;
        _dbContext = dbContext;
        _environment = environment;
    }

    #region Category
    public IActionResult Category() => View();
    public async Task<IActionResult> AddProduct()
    {
        ViewBag.Categories = await _dbContext.Categories.Where(c => !c.IsDeleted && c.Level == "L1").ToListAsync();
        return View();
    }
    public async Task<JsonResult> GetCategoriesByLevel(string level, int categoryId)
    {
        var res = await _dbContext.Categories.Where(c => !c.IsDeleted && c.Level == level && c.ParentCategoryId == categoryId).ToListAsync();
        return Json(res);
    }
    public async Task<JsonResult> GetLevelWiseCategories(string level)
    {
        var parameters = new DynamicParameters(); parameters.Add("@level", level);
        var res = await _dapper.ExecuteList<Category>("sp_GetLevelWiseCategories", parameters);
        return Json(res);
    }

    [HttpGet]
    public async Task<IActionResult> AddUpdateCategory(int categoryId = 0)
    {
        var item = await _dbContext.Categories.FirstOrDefaultAsync(c => !c.IsDeleted && c.CategoryId == categoryId);
        if (item?.ParentCategoryId > 0)
        {
            var subCategory = await _dbContext.Categories.FirstOrDefaultAsync(c => !c.IsDeleted && c.CategoryId == item.ParentCategoryId);
            ViewBag.SubCategory = subCategory?.CategoryName;
        }
        return PartialView(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddUpdateCategory(Category model)
    {
        try
        {
            var files = Request.Form.Files;
            if (files?.Count() > 0)
            {
                var file = files.FirstOrDefault();
                if (file != null)
                {
                    var extension = Path.GetExtension(file.FileName);
                    var fileName = Path.GetFileNameWithoutExtension(file.FileName);
                    var fullFileName = string.Concat(fileName, DateTime.UtcNow.Ticks, extension);
                    var directory = Path.Combine(_environment.WebRootPath, "Uploads");
                    if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);
                    using (var stream = new FileStream(Path.Combine(directory, fullFileName), FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    model.ImageName = fullFileName;
                }
            }
            if (model.CategoryId > 0)
            {
                var item = await _dbContext.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.CategoryId == model.CategoryId);
                model.ImageName = model.ImageName ?? item?.ImageName ?? "";
                _dbContext.Categories.Update(model);
            }
            else _dbContext.Categories.Add(model);
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(Category));
    }
    public async Task<JsonResult> DeleteCategory(int categoryId)
    {
        var item = await _dbContext.Categories.FirstOrDefaultAsync(c => !c.IsDeleted && c.CategoryId == categoryId);
        if (item != null) { item.IsDeleted = true; _dbContext.Categories.Update(item); }
        var res = await _dbContext.SaveChangesAsync();
        return Json(res);
    }
    #endregion

    #region Product
    public IActionResult Product() => View();

    [HttpGet]
    public async Task<IActionResult> AddUpdateProduct(long productId = 0, int categoryId = 0)
    {
        var item = await _dbContext.Products.FirstOrDefaultAsync(p => !p.IsDeleted && p.ProductId == productId);
        ViewBag.CategoryId = categoryId;
        return PartialView(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddUpdateProduct(Product model)
    {
        try
        {
            var files = Request.Form.Files;
            if (files?.Count() > 0)
            {
                var file = files.FirstOrDefault();
                if (file != null)
                {
                    var extension = Path.GetExtension(file.FileName);
                    var fileName = Path.GetFileNameWithoutExtension(file.FileName);
                    var fullFileName = string.Concat(fileName, DateTime.UtcNow.Ticks, extension);
                    var directory = Path.Combine(_environment.WebRootPath, "Uploads");
                    if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);
                    using (var stream = new FileStream(Path.Combine(directory, fullFileName), FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    model.ImageName = fullFileName;
                }
            }
            var item = await _dbContext.Products.AsNoTracking().FirstOrDefaultAsync(p => p.ProductId == model.ProductId);
            if (item != null) _dbContext.Products.Update(model);
            else _dbContext.Products.Add(model);
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(AddProduct));
    }
    public async Task<JsonResult> DeleteProduct(long productId)
    {
        var item = await _dbContext.Products.FirstOrDefaultAsync(p => !p.IsDeleted && p.ProductId == productId);
        if (item != null) { item.IsDeleted = true; _dbContext.Products.Update(item); }
        var res = await _dbContext.SaveChangesAsync();
        return Json(res);
    }
    #endregion

    #region Product Variant
    public IActionResult ProductVariant() => View();
    public async Task<JsonResult> GetProductsByCategory(int categoryId = 0)
    {
        var list = await _dbContext.Products.Where(c => !c.IsDeleted && c.CategoryId == categoryId).ToListAsync();
        return Json(list);
    }

    [HttpGet]
    public async Task<IActionResult> AddUpdateProductVariant(long variantId = 0)
    {
        var item = await _dbContext.ProductVariants.FirstOrDefaultAsync(c => !c.IsDeleted && c.VariantId == variantId);
        if (item != null) ViewBag.Products = await _dbContext.Products.Where(c => !c.IsDeleted && c.CategoryId == item.CategoryId).ToListAsync();
        ViewBag.Categories = await _dbContext.Categories.Where(c => !c.IsDeleted).ToListAsync();
        return PartialView(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddUpdateProductVariant(ProductVariant model)
    {
        try
        {
            var files = Request.Form.Files;
            if (files?.Count() > 0)
            {
                var file = files.FirstOrDefault();
                if (file != null)
                {
                    var extension = Path.GetExtension(file.FileName);
                    var fileName = Path.GetFileNameWithoutExtension(file.FileName);
                    var fullFileName = string.Concat(fileName, DateTime.UtcNow.Ticks, extension);
                    var directory = Path.Combine(_environment.WebRootPath, "Uploads");
                    if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);
                    using (var stream = new FileStream(Path.Combine(directory, fullFileName), FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    model.ImageName = fullFileName;
                }
            }
            if (model.VariantId > 0)
            {
                var item = await _dbContext.ProductVariants.AsNoTracking().FirstOrDefaultAsync(c => c.VariantId == model.VariantId);
                model.ImageName = model.ImageName ?? item?.ImageName ?? "";
                model.Stock += model.Quantity - item?.Quantity ?? 0;
                _dbContext.ProductVariants.Update(model);
            }
            else
            {
                model.Quantity = model.Stock;
                _dbContext.ProductVariants.Add(model);
            }
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(ProductVariant));
    }
    public async Task<JsonResult> DeleteProductVariant(long variantId)
    {
        var item = await _dbContext.ProductVariants.FirstOrDefaultAsync(c => !c.IsDeleted && c.VariantId == variantId);
        if (item != null) { item.IsDeleted = true; _dbContext.ProductVariants.Update(item); }
        var res = await _dbContext.SaveChangesAsync();
        return Json(res);
    }
    #endregion

    #region User
    public new IActionResult User() => View();

    [HttpGet]
    public async Task<IActionResult> AddUpdateUser(long userId = 0)
    {
        var item = await _dbContext.Users.FirstOrDefaultAsync(c => !c.IsDeleted && c.UserId == userId);
        ViewBag.Password = await _dbContext.Database.SqlQuery<string>($"select convert(nvarchar(50),DECRYPTBYPASSPHRASE('Shivam@97',Password))value from Users where UserId={userId}").FirstOrDefaultAsync();
        return PartialView(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddUpdateUser(User model)
    {
        try
        {
            model.Password = Array.Empty<byte>();
            if (model.UserId > 0)
            {
                var item = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == model.UserId);
                if (item != null)
                {
                    item.UserName = model.UserName;
                    item.Mobile = model.Mobile;
                    item.IsMobileVerified = item.Mobile != model.Mobile ? false : item.IsMobileVerified;
                    item.Email = model.Email;
                    item.IsEmailVerified = item.Email != model.Email ? false : item.IsEmailVerified;
                    item.Password = model.Password;
                    _dbContext.Users.Update(item);
                }
            }
            else _dbContext.Users.Add(model);
            await _dbContext.SaveChangesAsync();
            if (model.UserId > 0)
            {
                string password = Request.Form["Password"].ToString() ?? string.Empty;
                await _dbContext.Database.ExecuteSqlRawAsync("exec sp_update_user_password @userId, @password",
                    new SqlParameter("@userId", model.UserId), new SqlParameter("@password", password));
            }
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(User));
    }
    public async Task<JsonResult> DeleteUser(long userId)
    {
        var item = await _dbContext.Users.FirstOrDefaultAsync(c => !c.IsDeleted && c.UserId == userId);
        if (item != null) { item.IsDeleted = true; _dbContext.Users.Update(item); }
        var res = await _dbContext.SaveChangesAsync();
        return Json(res);
    }
    #endregion

    #region User Roles
    public IActionResult UserRole() => View();

    [HttpGet]
    public async Task<IActionResult> AddUpdateUserRole(int roleId = 0)
    {
        var item = await _dbContext.UserRoles.FirstOrDefaultAsync(c => !c.IsDeleted && c.RoleId == roleId);
        return PartialView(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddUpdateUserRole(UserRole model)
    {
        try
        {
            var item = await _dbContext.UserRoles.AsNoTracking().FirstOrDefaultAsync(p => p.RoleId == model.RoleId);
            if (item != null) _dbContext.UserRoles.Update(model);
            else _dbContext.UserRoles.Add(model);
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(UserRole));
    }
    public async Task<JsonResult> DeleteUserRole(int roleId)
    {
        var item = await _dbContext.UserRoles.FirstOrDefaultAsync(c => !c.IsDeleted && c.RoleId == roleId);
        if (item != null) { item.IsDeleted = true; _dbContext.UserRoles.Update(item); }
        var res = await _dbContext.SaveChangesAsync();
        return Json(res);
    }
    #endregion

    #region Store
    public IActionResult Store() => View();
    public async Task<JsonResult> GetNearbyMarketList(int cityId)
        => Json(await _dbContext.Locations.Where(w => !w.IsDeleted && w.ParentLocationId == cityId).ToListAsync());
    private async Task<string> UploadFile(IFormFile file, string folderName)
    {
        var extension = Path.GetExtension(file.FileName);
        var fileName = Path.GetFileNameWithoutExtension(file.FileName);
        var fullFileName = string.Concat(fileName, DateTime.UtcNow.Ticks, extension);
        var directory = Path.Combine(_environment.WebRootPath, "Uploads", folderName);
        if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);
        using (var stream = new FileStream(Path.Combine(directory, fullFileName), FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        return fullFileName;
    }
    public async Task<IActionResult> AddUpdateStore(long storeId = 0)
    {
        var item = await _dbContext.Stores.FirstOrDefaultAsync(c => !c.IsDeleted && c.StoreId == storeId);
        return PartialView(item);
    }
    public async Task<IActionResult> AddUpdateStoreDetails(long storeId = 0)
    {
        var item = await _dbContext.Stores.FirstOrDefaultAsync(c => !c.IsDeleted && c.StoreId == storeId);
        return PartialView(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddUpdateStoreDetails(Store model)
    {
        try
        {
            var files = Request.Form.Files;
            if (files?.Count() > 0)
            {
                var imageFile = files["ImageFile"];
                var bannerFile = files["BannerFile"];
                if (imageFile != null) model.ImageName = await UploadFile(imageFile, "StoreImages");
                if (bannerFile != null) model.BannerName = await UploadFile(bannerFile, "StoreImages");
            }
            if (model.StoreId > 0)
            {
                var item = await _dbContext.Stores.AsNoTracking().FirstOrDefaultAsync(c => c.StoreId == model.StoreId);
                model.ImageName = model.ImageName ?? item?.ImageName ?? "";
                model.BannerName = model.BannerName ?? item?.BannerName ?? "";
                _dbContext.Stores.Update(model);
            }
            else
            {
                _dbContext.Stores.Add(model);
            }
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(AddUpdateStoreDetails), new { storeId = model.StoreId });
    }
    public async Task<IActionResult> AddUpdateStoreLocation(long storeId = 0, long locationId = 0)
    {
        ViewBag.CityList = await _dbContext.Database.SqlQueryRaw<City>("sp_GetCityList").ToListAsync();
        ViewBag.StoreLocations = await _dbContext.StoreLocations.Where(c => !c.IsDeleted && c.StoreId == storeId).ToListAsync();
        var item = await _dbContext.StoreLocations.FirstOrDefaultAsync(c => !c.IsDeleted && c.LocationId == locationId);
        item = item != null ? item : new StoreLocation { Address = "", City = "", NearbyMarket = "", StoreId = storeId };
        ViewBag.NearbyMarketList = await _dbContext.Locations.Where(w => !w.IsDeleted && w.ParentLocationId == item.CityId).ToListAsync();
        return PartialView(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddUpdateStoreLocation(StoreLocation model)
    {
        try
        {
            if (model.LocationId > 0)
            {
                _dbContext.StoreLocations.Update(model);
            }
            else
            {
                _dbContext.StoreLocations.Add(model);
            }
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(AddUpdateStoreLocation), new { storeId = model.StoreId });
    }
    public async Task<IActionResult> AddUpdateStoreTiming(long storeId = 0, long timingId = 0)
    {
        var item = await _dbContext.StoreTimings.FirstOrDefaultAsync(c => !c.IsDeleted && c.TimingId == timingId);
        item = item != null ? item : new StoreTiming { OpeningDays = "", OpeningTime = "", ClosingTime = "" };
        ViewBag.StoreTimings = await _dbContext.StoreTimings.Where(c => !c.IsDeleted && c.StoreId == storeId).ToListAsync();
        return PartialView(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddUpdateStoreTiming(StoreTiming model)
    {
        try
        {
            if (model.TimingId > 0)
            {
                _dbContext.StoreTimings.Update(model);
            }
            else
            {
                _dbContext.StoreTimings.Add(model);
            }
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(AddUpdateStoreTiming), new { storeId = model.StoreId });
    }
    public async Task<JsonResult> DeleteStore(long storeId)
    {
        var item = await _dbContext.Stores.FirstOrDefaultAsync(c => !c.IsDeleted && c.StoreId == storeId);
        if (item != null) { item.IsDeleted = true; _dbContext.Stores.Update(item); }
        var res = await _dbContext.SaveChangesAsync();
        return Json(res);
    }
    public async Task<JsonResult> DeleteStoreLocation(long locationId)
    {
        var item = await _dbContext.StoreLocations.FirstOrDefaultAsync(c => !c.IsDeleted && c.LocationId == locationId);
        if (item != null) { item.IsDeleted = true; _dbContext.StoreLocations.Update(item); }
        var res = await _dbContext.SaveChangesAsync();
        return Json(res);
    }
    public async Task<JsonResult> DeleteStoreTiming(long timingId)
    {
        var item = await _dbContext.StoreTimings.FirstOrDefaultAsync(c => !c.IsDeleted && c.TimingId == timingId);
        if (item != null) { item.IsDeleted = true; _dbContext.StoreTimings.Update(item); }
        var res = await _dbContext.SaveChangesAsync();
        return Json(res);
    }
    #endregion
}