using Dapper;
using Ecocys.Admin.Core;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System.Data;

namespace Ecocys.Admin.DAL
{
    public class DapperService : IDapperService
    {
        private readonly string _connectionString;
        public DapperService(string connectionString)
        {
            _connectionString = connectionString;
        }
        public async Task<string> ExecuteJson(string query)
        {
            return JsonConvert.SerializeObject(await Execute(query, null, CommandType.Text));
        }
        public async Task<DataTable> Execute(string query, object? parameters, CommandType? commandType)
        {
            var dataTable = new DataTable();
            using IDbConnection db = new SqlConnection(_connectionString);
            try
            {
                if (db.State == ConnectionState.Closed) db.Open();
                using var transaction = db.BeginTransaction();
                try
                {
                    dataTable.Load(await db.ExecuteReaderAsync(query, parameters, transaction, default, commandType ?? CommandType.StoredProcedure));
                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    ex.HResult = 0;
                    throw;
                }
            }
            catch (Exception ex)
            {
                ex.HResult = 0;
                throw;
            }
            finally
            {
                if (db.State == ConnectionState.Open) db.Close();
            }
            return dataTable;
        }
        public async Task<T?> Execute<T>(string query, object? parameters, CommandType? commandType)
        {
            T? t;
            using IDbConnection db = new SqlConnection(_connectionString);
            try
            {
                if (db.State == ConnectionState.Closed) db.Open();
                using var transaction = db.BeginTransaction();
                try
                {
                    t = await db.QueryFirstOrDefaultAsync<T>(query, parameters, transaction, null, commandType ?? CommandType.StoredProcedure);
                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    ex.HResult = 0;
                    throw;
                }
            }
            catch (Exception ex)
            {
                ex.HResult = 0;
                throw;
            }
            finally
            {
                if (db.State == ConnectionState.Open) db.Close();
            }
            return t;
        }
        public async Task<List<T>> ExecuteList<T>(string query, object? parameters, CommandType? commandType)
        {
            IEnumerable<T> t;
            using IDbConnection db = new SqlConnection(_connectionString);
            try
            {
                if (db.State == ConnectionState.Closed) db.Open();
                using var transaction = db.BeginTransaction();
                try
                {
                    t = await db.QueryAsync<T>(query, parameters, transaction, default, commandType ?? CommandType.StoredProcedure);
                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    ex.HResult = 0;
                    throw;
                }
            }
            catch (Exception ex)
            {
                ex.HResult = 0;
                throw;
            }
            finally
            {
                if (db.State == ConnectionState.Open) db.Close();
            }
            return t.ToList();
        }
    }
}