# Test script for Admin and SubAdmin endpoints
Write-Host "Testing Admin and SubAdmin API Endpoints" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Yellow

# Base URL
$baseUrl = "https://localhost:7209/api"

# Ignore SSL certificate validation for localhost testing
add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

# Test Admin endpoints
Write-Host "Testing Admin endpoints..." -ForegroundColor Green
try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/Admin" -Method Get
    Write-Host "GET /Admin - Success: Found $($adminResponse.Count) admins" -ForegroundColor Green
} catch {
    Write-Host "GET /Admin - Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test SubAdmin endpoints
Write-Host "Testing SubAdmin endpoints..." -ForegroundColor Green
try {
    $subAdminResponse = Invoke-RestMethod -Uri "$baseUrl/SubAdmin" -Method Get
    Write-Host "GET /SubAdmin - Success: Found $($subAdminResponse.Count) subadmins" -ForegroundColor Green
} catch {
    Write-Host "GET /SubAdmin - Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test a working endpoint for comparison
Write-Host "Testing working endpoint (Products)..." -ForegroundColor Green
try {
    $productResponse = Invoke-RestMethod -Uri "$baseUrl/Product/get-all" -Method Get
    Write-Host "GET /Product/get-all - Success: Found $($productResponse.Count) products" -ForegroundColor Green
} catch {
    Write-Host "GET /Product/get-all - Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test completed!" -ForegroundColor Cyan
Write-Host "If you see errors above, the backend may not be running or there are database issues." -ForegroundColor Yellow
Write-Host "Make sure the backend is running with: dotnet run" -ForegroundColor Yellow 