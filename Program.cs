using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using PscTechBackend.Data;
using PscTechBackend.Middleware;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

var builder = WebApplication.CreateBuilder(args);

// Add configuration
builder.Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Key Vault (optional) - uses managed identity in Azure
var keyVaultUrl = builder.Configuration["KeyVault:VaultUri"];
if (!string.IsNullOrWhiteSpace(keyVaultUrl))
{
    try
    {
        var credential = new DefaultAzureCredential();
        builder.Configuration.AddAzureKeyVault(new Uri(keyVaultUrl), credential);
    }
    catch
    {
        // Ignore KeyVault init errors locally
    }
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "PSC Tech Backend API", 
        Version = "1.0.0",
        Description = "Professional voucher system backend for PSC Tech multi-tenant platform"
    });
});

// Add Entity Framework with PostgreSQL
builder.Services.AddDbContext<PscTechDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Security:CorsOrigins").Get<string[]>() ?? new string[0];
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.DisallowCredentials();
        }
    });
});

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Apply EF migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PscTechDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Enable Swagger in all environments (Production included)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PSC Tech Backend API V1");
});

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowAll");

// Add JWT middleware
app.UseMiddleware<JwtMiddleware>();

// Health check endpoint
app.MapHealthChecks("/health");

// Custom health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { 
    status = "ok", 
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName,
    framework = "ASP.NET Core 8.0"
}));

// Database connectivity test endpoint
app.MapGet("/api/db-test", async (PscTechDbContext context) =>
{
    try
    {
        var canConnect = await context.Database.CanConnectAsync();
        int institutionCount = 0;
        if (canConnect)
        {
            institutionCount = await context.Institutions.CountAsync();
        }
        return Results.Ok(new
        {
            database = canConnect ? "reachable" : "unreachable",
            canConnect,
            institutions = institutionCount,
            timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

// Test database connection
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PscTechDbContext>();
    try
    {
        Console.WriteLine("Testing database connection...");
        Console.WriteLine($"Connection string: {builder.Configuration.GetConnectionString("DefaultConnection")}");
        
        // Test connection
        var canConnect = context.Database.CanConnect();
        Console.WriteLine($"Database connection successful: {canConnect}");
        
        if (canConnect)
        {
            // Test a simple query to verify schema compatibility
            var institutionCount = context.Institutions.Count();
            Console.WriteLine($"Database schema is compatible. Found {institutionCount} institutions.");
        }
        else
        {
            Console.WriteLine("Cannot connect to database - check connection string and firewall rules");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database connection error: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
    }
}

// API endpoints
app.MapControllers();

// Root endpoint - Simple welcome message
app.MapGet("/", () => Results.Ok(new { 
    message = "PSC Tech Backend API",
    version = "1.0.0",
    status = "running",
    timestamp = DateTime.UtcNow,
    endpoints = new[] {
        "/health",
        "/api/health",
        "/swagger",
        "/api/institution/register",
        "/api/institution",
        "/api/institution/{id}"
    }
}));

app.Run();


