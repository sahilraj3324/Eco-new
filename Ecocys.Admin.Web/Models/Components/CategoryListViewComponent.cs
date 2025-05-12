using Ecocys.Admin.Core;
using Ecocys.Admin.Core.Master;
using Ecocys.Admin.DAL;
using Microsoft.AspNetCore.Mvc;

namespace Ecocys.Admin.Web.Models.Components
{
    public class CategoryListViewComponent : ViewComponent
    {
        private readonly IDapperService _dapper;
        private readonly EFDatabaseContext _dbContext;
        public CategoryListViewComponent(IDapperService dapper, EFDatabaseContext dbContext)
        {
            _dapper = dapper;
            _dbContext = dbContext;
        }
        public async Task<IViewComponentResult> InvokeAsync()
        {
            var list = await GetListAsync();
            return View(list);
        }
        private async Task<List<Category>> GetListAsync()
        {
            var list = await _dapper.ExecuteList<Category>("sp_GetCategoryList");
            return list ?? new();
        }
    }
}