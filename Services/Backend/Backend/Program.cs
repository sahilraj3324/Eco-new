using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            try
            {
                // Automatically detect developer's machine and use appropriate connection string
                string connectionStringKey = GetConnectionStringForCurrentMachine();
                
                // Debug output to show which connection is being used
                Console.WriteLine($"🖥️  Machine: {Environment.MachineName}");
                Console.WriteLine($"🔗 Using connection key: {connectionStringKey}");
                
                // Get the actual connection string
                string? connectionString = builder.Configuration.GetConnectionString(connectionStringKey);
                
                if (string.IsNullOrEmpty(connectionString))
                {
                    Console.WriteLine($"❌ ERROR: Connection string '{connectionStringKey}' not found!");
                    Console.WriteLine("Available connection strings:");
                    var connectionStrings = builder.Configuration.GetSection("ConnectionStrings").GetChildren();
                    foreach (var cs in connectionStrings)
                    {
                        Console.WriteLine($"   - {cs.Key}");
                    }
                    throw new InvalidOperationException($"Connection string '{connectionStringKey}' not found in configuration.");
                }
                
                Console.WriteLine($"✅ Connection string found: {connectionString.Substring(0, Math.Min(50, connectionString.Length))}...");
                
                // Add services to the container.
                builder.Services.AddDbContext<EcoContext>(options =>
                {
                    options.UseSqlServer(connectionString);
                    options.EnableSensitiveDataLogging(); // For development debugging
                    options.EnableDetailedErrors(); // For development debugging
                });

                // Identity & Auth setup
                builder.Services.AddIdentityCore<AppUser>(opts =>
                {
                    opts.Password.RequireDigit = true;
                    opts.Password.RequiredLength = 8;
                    opts.Password.RequireNonAlphanumeric = false;
                    opts.Password.RequireUppercase = false;
                    opts.Password.RequireLowercase = false;
                })
                .AddRoles<IdentityRole<Guid>>()
                .AddEntityFrameworkStores<EcoContext>();

                // Authentication schemes
                builder.Services.AddAuthentication()
                    .AddCookie("AdminScheme")
                    .AddJwtBearer("VendorScheme", opts =>
                    {
                        var jwt = builder.Configuration.GetSection("Jwt");
                        opts.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidIssuer = jwt["Issuer"],
                            ValidateAudience = true,
                            ValidAudience = jwt["Audience"],
                            ValidateLifetime = true,
                            IssuerSigningKey = new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(jwt["Key"] ?? throw new ArgumentException("JWT Key not configured")))
                        };
                    });

                // Register Twilio & Reset services
                builder.Services.AddTransient<ITwilioVerify, TwilioVerify>();
                builder.Services.AddTransient<IPasswordResetService, PasswordResetService>();

                // Register Cashfree services
                builder.Services.Configure<CashfreeConfig>(builder.Configuration.GetSection("Cashfree"));
                builder.Services.AddHttpClient<ICashfreeService, CashfreeService>();

                // Add CORS policy
                builder.Services.AddCors(options =>
                {
                    options.AddPolicy("AllowFrontend", policy =>
                    {
                        policy.WithOrigins(
                            "http://localhost:5173",  // Retailer app
                            "http://localhost:5174",  // Admin panel
                            "http://localhost:3000",  // Alternative port
                            "http://localhost:5175",  // Vendor app
                            "http://localhost:5176"   // Another alternative
                        )
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                    });
                });

                // Configure JSON serialization options
                builder.Services.ConfigureHttpJsonOptions(options =>
                {
                    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                    options.SerializerOptions.PropertyNameCaseInsensitive = true;
                });

                builder.Services.AddControllers()
                    .AddJsonOptions(options =>
                    {
                        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                    });
                // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
                builder.Services.AddEndpointsApiExplorer();
                builder.Services.AddSwaggerGen();

                var app = builder.Build();

                // Test database connection
                Console.WriteLine("🔄 Testing database connection...");
                using (var scope = app.Services.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<EcoContext>();
                    if (context.Database.CanConnect())
                    {
                        Console.WriteLine("✅ Database connection successful!");
                    }
                    else
                    {
                        Console.WriteLine("❌ Database connection failed!");
                    }
                }

                // Configure the HTTP request pipeline.
                if (app.Environment.IsDevelopment())
                {
                    app.UseSwagger();
                    app.UseSwaggerUI();
                }

                app.UseHttpsRedirection();

                // Enable CORS
                app.UseCors("AllowFrontend");

                // Authentication middleware
                app.UseAuthentication();
                app.UseAuthorization();

                app.MapControllers();

                Console.WriteLine("🚀 Application starting...");
                app.Run();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Application failed to start: {ex.Message}");
                Console.WriteLine($"📝 Full error: {ex}");
                throw;
            }
        }

        private static string GetConnectionStringForCurrentMachine()
        {
            // Get the computer name
            string machineName = Environment.MachineName.ToUpper();
            
            Console.WriteLine($"🔍 Detected machine name: '{machineName}'");
            
            // Map machine names to connection string keys
            string connectionKey = machineName switch
            {
                "DESKTOP-A2CPUB1" => "SahilConnection",    // Sahil's machine
                "VANQUISHER" => "BevanConnection",         // Bevan's machine
                "SHIVUUU" => "ShivuConnection",            // Shivu's machine
                _ => "DefaultConnection"                   // Default fallback
            };
            
            Console.WriteLine($"🎯 Mapped to connection key: '{connectionKey}'");
            return connectionKey;
        }
    }
}
