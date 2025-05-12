using Ecocys.Admin.Core.Master;
using Ecocys.Admin.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecocys.Admin.Web.Models.Components
{
    public class ProductVariantListViewComponent : ViewComponent
    {
        private readonly EFDatabaseContext _dbContext;
        public ProductVariantListViewComponent(EFDatabaseContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<IViewComponentResult> InvokeAsync()
        {
            var list = await GetListAsync();
            return View(list);
        }
        private async Task<List<ProductVariant>> GetListAsync()
        {
            var list = await _dbContext.ProductVariants.Where(w => !w.IsDeleted).ToListAsync();
            return list ?? new();
        }
    }
}