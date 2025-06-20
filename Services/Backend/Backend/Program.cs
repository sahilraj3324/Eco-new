using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DotNetEnv; // Add this for environment variables

namespace Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Load environment variables from .env file
            var envFile = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production" 
                ? ".env.production" 
                : ".env";
            
            if (File.Exists(envFile))
            {
                Env.Load(envFile);
                Console.WriteLine($"✅ Loaded environment variables from {envFile}");
            }
            else
            {
                Console.WriteLine($"⚠️  Environment file {envFile} not found, using system/configuration variables");
            }

            var builder = WebApplication.CreateBuilder(args);
            
            // Override configuration with environment variables
            OverrideConfigurationWithEnvironmentVariables(builder.Configuration);
            
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

                // Only use HTTPS redirection in production
                if (!app.Environment.IsDevelopment())
                {
                    app.UseHttpsRedirection();
                }

                // Enable CORS (must be before authentication)
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

        private static void OverrideConfigurationWithEnvironmentVariables(IConfiguration configuration)
        {
            // Override connection strings
            var connectionStrings = new Dictionary<string, string>
            {
                ["DefaultConnection"] = Environment.GetEnvironmentVariable("CONNECTION_STRING_DEFAULT"),
                ["SahilConnection"] = Environment.GetEnvironmentVariable("CONNECTION_STRING_SAHIL"),
                ["BevanConnection"] = Environment.GetEnvironmentVariable("CONNECTION_STRING_BEVAN"),
                ["ShivuConnection"] = Environment.GetEnvironmentVariable("CONNECTION_STRING_SHIVU")
            };

            foreach (var kvp in connectionStrings)
            {
                if (!string.IsNullOrEmpty(kvp.Value))
                {
                    configuration[$"ConnectionStrings:{kvp.Key}"] = kvp.Value;
                }
            }

            // Override other configuration sections
            var configs = new Dictionary<string, string>
            {
                // Twilio
                ["Twilio:AccountSid"] = Environment.GetEnvironmentVariable("TWILIO_ACCOUNT_SID"),
                ["Twilio:AuthToken"] = Environment.GetEnvironmentVariable("TWILIO_AUTH_TOKEN"),
                ["Twilio:VerifySid"] = Environment.GetEnvironmentVariable("TWILIO_VERIFY_SID"),
                
                // JWT
                ["Jwt:Key"] = Environment.GetEnvironmentVariable("JWT_KEY"),
                ["Jwt:Issuer"] = Environment.GetEnvironmentVariable("JWT_ISSUER"),
                ["Jwt:Audience"] = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
                ["Jwt:ExpireMinutes"] = Environment.GetEnvironmentVariable("JWT_EXPIRE_MINUTES"),
                
                // Cashfree
                ["Cashfree:ClientId"] = Environment.GetEnvironmentVariable("CASHFREE_CLIENT_ID"),
                ["Cashfree:ClientSecret"] = Environment.GetEnvironmentVariable("CASHFREE_CLIENT_SECRET"),
                ["Cashfree:BaseUrl"] = Environment.GetEnvironmentVariable("CASHFREE_BASE_URL"),
                ["Cashfree:Version"] = Environment.GetEnvironmentVariable("CASHFREE_VERSION"),
                
                // General
                ["AllowedHosts"] = Environment.GetEnvironmentVariable("ALLOWED_HOSTS")
            };

            foreach (var kvp in configs)
            {
                if (!string.IsNullOrEmpty(kvp.Value))
                {
                    configuration[kvp.Key] = kvp.Value;
                }
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
