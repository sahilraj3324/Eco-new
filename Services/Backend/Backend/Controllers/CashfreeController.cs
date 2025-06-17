using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CashfreeController : ControllerBase
    {
        private readonly EcoContext _context;
        private readonly ICashfreeService _cashfreeService;

        public CashfreeController(EcoContext context, ICashfreeService cashfreeService)
        {
            _context = context;
            _cashfreeService = cashfreeService;
        }

        // GET: api/Cashfree/config
        [HttpGet("config")]
        public IActionResult GetCashfreeConfig()
        {
            try
            {
                // Return only safe configuration data (no secrets)
                return Ok(new
                {
                    baseUrl = "https://sandbox.cashfree.com",
                    version = "2023-08-01",
                    environment = "sandbox",
                    features = new
                    {
                        paymentMethods = new[] { "card", "netbanking", "upi", "wallet" },
                        currencies = new[] { "INR" },
                        maxOrderAmount = 1000000,
                        minOrderAmount = 1
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting config: {ex.Message}");
            }
        }

        // GET: api/Cashfree/orders
        [HttpGet("orders")]
        public async Task<IActionResult> GetAllCashfreeOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Where(o => !string.IsNullOrEmpty(o.CashfreeOrderId))
                    .Include(o => o.Product)
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => new
                    {
                        o.Id,
                        o.BuyerId,
                        o.CashfreeOrderId,
                        o.PaymentId,
                        o.PaymentStatus,
                        o.PaymentMethod,
                        o.TotalAmount,
                        o.OrderDate,
                        o.PaymentDate,
                        o.Status,
                        ProductName = o.Product != null ? o.Product.Name : "Unknown Product",
                        o.Quantity,
                        o.UnitPrice
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalOrders = orders.Count,
                    orders = orders,
                    summary = new
                    {
                        totalAmount = orders.Sum(o => o.TotalAmount),
                        successfulPayments = orders.Count(o => o.PaymentStatus == "SUCCESS"),
                        pendingPayments = orders.Count(o => o.PaymentStatus == "INITIATED" || o.PaymentStatus == "PENDING"),
                        failedPayments = orders.Count(o => o.PaymentStatus == "FAILED")
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting orders: {ex.Message}");
            }
        }

        // GET: api/Cashfree/orders/{orderId}
        [HttpGet("orders/{orderId}")]
        public async Task<IActionResult> GetCashfreeOrder(Guid orderId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.Product)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                    return NotFound("Order not found");

                // Get latest payment status from Cashfree if order has Cashfree ID
                if (!string.IsNullOrEmpty(order.CashfreeOrderId))
                {
                    try
                    {
                        var paymentStatus = await _cashfreeService.GetPaymentStatusAsync(order.CashfreeOrderId);
                        if (paymentStatus != null)
                        {
                            // Update order with latest status
                            order.PaymentStatus = paymentStatus.payment_status;
                            order.PaymentMethod = paymentStatus.payment_method;
                            
                            if (paymentStatus.payment_status == "SUCCESS" && order.PaymentDate == null)
                            {
                                order.PaymentDate = paymentStatus.payment_time;
                                order.Status = "Processed";
                                order.ProcessedAt = DateTime.UtcNow;
                            }
                            
                            await _context.SaveChangesAsync();
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error fetching payment status from Cashfree: {ex.Message}");
                    }
                }

                return Ok(new
                {
                    order.Id,
                    order.BuyerId,
                    order.CashfreeOrderId,
                    order.PaymentId,
                    order.PaymentStatus,
                    order.PaymentMethod,
                    order.PaymentReference,
                    order.TotalAmount,
                    order.OrderDate,
                    order.PaymentDate,
                    order.Status,
                    order.ProcessedAt,
                    order.ShippingAddress,
                    ProductName = order.Product?.Name,
                    order.Quantity,
                    order.UnitPrice,
                    order.VariantId,
                    order.SellerId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting order: {ex.Message}");
            }
        }

        // POST: api/Cashfree/webhook
        [HttpPost("webhook")]
        public async Task<IActionResult> HandleWebhook([FromBody] dynamic webhookData)
        {
            try
            {
                Console.WriteLine($"Cashfree webhook received: {webhookData}");
                
                // Parse webhook data
                var webhookJson = webhookData.ToString();
                var webhookObj = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(webhookJson);

                if (webhookObj.TryGetProperty("data", out System.Text.Json.JsonElement dataElement))
                {
                    if (dataElement.TryGetProperty("order", out System.Text.Json.JsonElement orderElement))
                    {
                        var orderId = orderElement.GetProperty("order_id").GetString();
                        
                        // Find order by Cashfree order ID
                        var order = await _context.Orders.FirstOrDefaultAsync(o => o.CashfreeOrderId == orderId);
                        if (order == null)
                        {
                            Console.WriteLine($"Order not found for Cashfree ID: {orderId}");
                            return BadRequest("Order not found");
                        }

                        // Update order status from webhook
                        if (dataElement.TryGetProperty("payment", out System.Text.Json.JsonElement paymentElement))
                        {
                            if (paymentElement.TryGetProperty("payment_status", out System.Text.Json.JsonElement statusElement))
                            {
                                var paymentStatus = statusElement.GetString();
                                order.PaymentStatus = paymentStatus;
                                
                                if (paymentElement.TryGetProperty("payment_method", out System.Text.Json.JsonElement methodElement))
                                    order.PaymentMethod = methodElement.GetString();
                                
                                if (paymentElement.TryGetProperty("cf_payment_id", out System.Text.Json.JsonElement paymentIdElement))
                                    order.PaymentId = paymentIdElement.GetString();

                                if (paymentStatus == "SUCCESS")
                                {
                                    order.Status = "Processed";
                                    order.ProcessedAt = DateTime.UtcNow;
                                    order.PaymentDate = DateTime.UtcNow;
                                }

                                await _context.SaveChangesAsync();
                                Console.WriteLine($"Order {order.Id} updated from webhook with status: {paymentStatus}");
                            }
                        }
                    }
                }

                return Ok(new { message = "Webhook processed successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing webhook: {ex.Message}");
                return StatusCode(500, $"Error processing webhook: {ex.Message}");
            }
        }

        // GET: api/Cashfree/statistics
        [HttpGet("statistics")]
        public async Task<IActionResult> GetPaymentStatistics()
        {
            try
            {
                var now = DateTime.UtcNow;
                var today = now.Date;
                var thisWeek = today.AddDays(-(int)today.DayOfWeek);
                var thisMonth = new DateTime(now.Year, now.Month, 1);

                var stats = new
                {
                    today = await GetStatsForPeriod(today, now),
                    thisWeek = await GetStatsForPeriod(thisWeek, now),
                    thisMonth = await GetStatsForPeriod(thisMonth, now),
                    allTime = await GetStatsForPeriod(DateTime.MinValue, now)
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting statistics: {ex.Message}");
            }
        }

        private async Task<object> GetStatsForPeriod(DateTime from, DateTime to)
        {
            var orders = await _context.Orders
                .Where(o => o.OrderDate >= from && o.OrderDate <= to && !string.IsNullOrEmpty(o.CashfreeOrderId))
                .ToListAsync();

            return new
            {
                totalOrders = orders.Count,
                totalAmount = orders.Sum(o => o.TotalAmount),
                successfulOrders = orders.Count(o => o.PaymentStatus == "SUCCESS"),
                pendingOrders = orders.Count(o => o.PaymentStatus == "INITIATED" || o.PaymentStatus == "PENDING"),
                failedOrders = orders.Count(o => o.PaymentStatus == "FAILED"),
                successRate = orders.Count > 0 ? (double)orders.Count(o => o.PaymentStatus == "SUCCESS") / orders.Count * 100 : 0
            };
        }
    }
} 