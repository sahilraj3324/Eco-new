using Microsoft.EntityFrameworkCore;
using Backend.Data;
using System.Runtime.InteropServices;

namespace Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            // Add CORS services
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    policy =>
                    {
                        policy.AllowAnyOrigin()
                              .AllowAnyHeader()
                              .AllowAnyMethod();
                    });
            });

            // Select the appropriate connection string based on OS
            string connectionStringName = "DefaultConnection";
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                connectionStringName = "WindowsConnection";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                connectionStringName = "MacConnection";
            }

            // Add services to the container
            builder.Services.AddDbContext<EcoContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString(connectionStringName)));

            builder.Services.AddControllers();
            
            // Configure Swagger/OpenAPI
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "Eco API",
                    Version = "v1"
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c => 
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Eco API v1");
                    // Set Swagger UI at the root
                    c.RoutePrefix = string.Empty;
                });
            }

            // Comment out HTTPS redirection for local development
            // app.UseHttpsRedirection();

            // Use CORS
            app.UseCors();

            app.UseAuthorization();

            app.MapControllers();

            // Redirect root to Swagger UI
            app.MapGet("/", () => Results.Redirect("/index.html"));

            app.Run();
        }
    }
}
