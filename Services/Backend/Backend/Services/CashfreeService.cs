using Backend.Models;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public interface ICashfreeService
    {
        Task<CashfreeOrderResponse> CreateOrderAsync(object orderRequest);
        Task<PaymentStatusResponse> GetPaymentStatusAsync(string orderId);
        Task<bool> TestConnectionAsync();
    }

    public class CashfreeService : ICashfreeService
    {
        private readonly HttpClient _httpClient;
        private readonly CashfreeConfig _config;
        private readonly ILogger<CashfreeService> _logger;

        public CashfreeService(HttpClient httpClient, IOptions<CashfreeConfig> config, ILogger<CashfreeService> logger)
        {
            _httpClient = httpClient;
            _config = config.Value;
            _logger = logger;
        }

        private void SetAuthHeaders()
        {
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
            _httpClient.DefaultRequestHeaders.Add("x-api-version", _config.Version);
            _httpClient.DefaultRequestHeaders.Add("x-client-id", _config.ClientId);
            _httpClient.DefaultRequestHeaders.Add("x-client-secret", _config.ClientSecret);
        }

        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                _logger.LogInformation("Testing Cashfree connection with Client ID: {ClientId}", _config.ClientId);
                
                // Test by creating a minimal test order request
                var testOrderRequest = new
                {
                    order_id = "TEST_" + DateTime.UtcNow.Ticks,
                    order_amount = 1.00m,
                    order_currency = "INR",
                    customer_details = new
                    {
                        customer_id = "test_customer",
                        customer_name = "Test Customer",
                        customer_email = "test@example.com",
                        customer_phone = "9999999999"
                    }
                };

                var json = JsonSerializer.Serialize(testOrderRequest, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                SetAuthHeaders();

                var response = await _httpClient.PostAsync($"{_config.BaseUrl}/pg/orders", content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                _logger.LogInformation("Test response status: {StatusCode}, Content: {Content}", 
                    response.StatusCode, responseContent);

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing Cashfree connection");
                return false;
            }
        }

        public async Task<CashfreeOrderResponse> CreateOrderAsync(object orderRequest)
        {
            try
            {
                var json = JsonSerializer.Serialize(orderRequest, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                SetAuthHeaders();

                var response = await _httpClient.PostAsync($"{_config.BaseUrl}/pg/orders", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var options = new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    };
                    
                    return JsonSerializer.Deserialize<CashfreeOrderResponse>(responseContent, options);
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to create Cashfree order. Status: {StatusCode}, Error: {Error}", 
                    response.StatusCode, errorContent);
                
                throw new Exception($"Failed to create order: {response.StatusCode}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Cashfree order");
                throw;
            }
        }

        public async Task<PaymentStatusResponse> GetPaymentStatusAsync(string orderId)
        {
            try
            {
                SetAuthHeaders();
                var response = await _httpClient.GetAsync($"{_config.BaseUrl}/pg/orders/{orderId}/payments");

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var paymentsArray = JsonSerializer.Deserialize<PaymentStatusResponse[]>(responseContent, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    return paymentsArray?.FirstOrDefault();
                }

                _logger.LogError("Failed to get payment status. Status: {StatusCode}", response.StatusCode);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment status for order {OrderId}", orderId);
                throw;
            }
        }
    }
} 