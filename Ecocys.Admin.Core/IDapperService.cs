using System.Data;

namespace Ecocys.Admin.Core
{
    public interface IDapperService
    {
        Task<string> ExecuteJson(string query);
        Task<DataTable> Execute(string query, object? parameters = null, CommandType? commandType = null);
        Task<T?> Execute<T>(string query, object? parameters = null, CommandType? commandType = null);
        Task<List<T>> ExecuteList<T>(string query, object? parameters = null, CommandType? commandType = null);
    }
}