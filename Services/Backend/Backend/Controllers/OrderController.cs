using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly EcoContext _context;
        private readonly ICashfreeService _cashfreeService;

        public OrderController(EcoContext context, ICashfreeService cashfreeService)
        {
            _context = context;
            _cashfreeService = cashfreeService;
        }

        // POST: api/Order
        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] Order order)
        {
            var product = await _context.Products.FindAsync(order.ProductId);
            if (product == null)
                return NotFound("Product not found");

            // Validate that the variant exists within the product
            if (!await IsValidVariant(order.ProductId, order.VariantId))
            {
                return BadRequest("Invalid variant for this product");
            }

            // Get variant details for pricing and stock validation
            var variant = GetVariantDetails(product, order.VariantId);
            if (variant == null)
            {
                return BadRequest("Variant details not found");
            }

            // Check variant stock instead of product stock
            if (int.TryParse(variant.Stock, out int variantStock))
            {
                if (variantStock < order.Quantity)
                    return BadRequest("Insufficient variant stock");
            }
            else
            {
                // Fallback to product stock if variant stock is not a valid number
                if (product.Stock < order.Quantity)
                    return BadRequest("Insufficient stock");
            }

            // 🛠️ Fixes:
            order.Id = Guid.NewGuid(); // Always generate new Order ID
            order.Product = null;      // Prevent trying to insert Product again
            order.SellerId = product.SellerId;
            order.UnitPrice = variant.Price; // Use variant price instead of product price
            order.OrderDate = DateTime.UtcNow;
            order.Status = "Pending";

            // Update variant stock if it's a valid number
            if (int.TryParse(variant.Stock, out variantStock))
            {
                variant.Stock = (variantStock - order.Quantity).ToString();
                // Update the product's variants JSON
                product.Variants = product.Variants; // This will trigger the setter to update VariantsJson
            }
            else
            {
                // Fallback to updating product stock
                product.Stock -= order.Quantity;
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        // POST: api/Order/create-bulk-payment
        [HttpPost("create-bulk-payment")]
        public async Task<IActionResult> CreateBulkPaymentOrder([FromBody] CreateBulkPaymentOrderRequest request)
        {
            try
            {
                Console.WriteLine($"Create bulk payment order request for buyer: {request.BuyerId}");
                
                // Verify the buyer exists in the database
                var buyerExists = await _context.Buyers.AnyAsync(b => b.Id == Guid.Parse(request.BuyerId));
                if (!buyerExists)
                {
                    Console.WriteLine($"Buyer {request.BuyerId} not found in database");
                    return BadRequest("Invalid buyer ID");
                }

                // Generate unique Cashfree order ID for bulk order
                var bulkCashfreeOrderId = $"BULK_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString()[..8]}";
                var orderIds = new List<Guid>();

                // Create orders for each item but don't save them yet
                var orders = new List<Order>();
                
                foreach (var item in request.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                        return NotFound($"Product not found: {item.ProductId}");

                    var order = new Order
                    {
                        Id = Guid.NewGuid(),
                        BuyerId = request.BuyerId,
                        ProductId = item.ProductId,
                        VariantId = item.VariantId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalAmount = item.UnitPrice * item.Quantity,
                        SellerId = item.SellerId,
                        Status = "Pending",
                        PaymentStatus = "INITIATED",
                        OrderDate = DateTime.UtcNow,
                        ShippingAddress = request.ShippingAddress,
                        CashfreeOrderId = bulkCashfreeOrderId, // All orders share the same Cashfree order ID
                        PaymentMethod = "Cashfree",
                        PaymentReference = $"BULK_ORDER_{bulkCashfreeOrderId}"
                    };

                    orders.Add(order);
                    orderIds.Add(order.Id);
                }

                // Create Cashfree order for the total amount
                var cashfreeOrderRequest = new
                {
                    order_id = bulkCashfreeOrderId,
                    order_amount = request.TotalAmount,
                    order_currency = "INR",
                    customer_details = new
                    {
                        customer_id = request.BuyerId,
                        customer_name = request.CustomerName ?? "Customer",
                        customer_email = request.CustomerEmail ?? "customer@example.com",
                        customer_phone = request.CustomerPhone ?? "9999999999"
                    },
                    order_meta = new
                    {
                        return_url = $"{Request.Scheme}://{Request.Host}/payment-success"
                    }
                };

                // Call Cashfree API to create order and get payment session
                var cashfreeResponse = await _cashfreeService.CreateOrderAsync(cashfreeOrderRequest);
                
                if (cashfreeResponse == null || string.IsNullOrEmpty(cashfreeResponse.PaymentSessionId))
                {
                    return StatusCode(500, "Failed to create Cashfree payment session");
                }

                // Update orders with payment session details and save them
                foreach (var order in orders)
                {
                    order.PaymentId = cashfreeResponse.PaymentSessionId;
                    order.PaymentReference = cashfreeResponse.OrderId;
                    _context.Orders.Add(order);
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"Bulk order created with {orders.Count} items, Cashfree Order ID: {bulkCashfreeOrderId}, Payment Session: {cashfreeResponse.PaymentSessionId}");

                // Return payment session details for frontend
                return Ok(new
                {
                    orderIds = orderIds,
                    cashfreeOrderId = bulkCashfreeOrderId,
                    paymentSessionId = cashfreeResponse.PaymentSessionId,
                    orderAmount = request.TotalAmount,
                    totalAmount = request.TotalAmount,
                    orderCurrency = "INR",
                    isBulkOrder = true,
                    totalItems = request.OrderItems.Count,
                    customerDetails = new
                    {
                        customerId = request.BuyerId,
                        customerName = request.CustomerName ?? "Customer",
                        customerEmail = request.CustomerEmail ?? "customer@example.com",
                        customerPhone = request.CustomerPhone ?? "9999999999"
                    },
                    returnUrl = $"{Request.Scheme}://{Request.Host}/payment-success"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating bulk payment order: {ex.Message}");
            }
        }

        // POST: api/Order/create-payment
        [HttpPost("create-payment")]
        public async Task<IActionResult> CreatePaymentOrder([FromBody] CreatePaymentOrderRequest request)
        {
            try
            {
                // Log request details for debugging
                Console.WriteLine($"Create payment order request for buyer: {request.BuyerId}");
                
                // Verify the buyer exists in the database
                var buyerExists = await _context.Buyers.AnyAsync(b => b.Id == Guid.Parse(request.BuyerId));
                if (!buyerExists)
                {
                    Console.WriteLine($"Buyer {request.BuyerId} not found in database");
                    return BadRequest("Invalid buyer ID");
                }
                var product = await _context.Products.FindAsync(request.ProductId);
                if (product == null)
                    return NotFound("Product not found");

                // Validate that the variant exists within the product
                if (!await IsValidVariant(request.ProductId, request.VariantId))
                {
                    return BadRequest("Invalid variant for this product");
                }

                var variant = GetVariantDetails(product, request.VariantId);
                if (variant == null)
                {
                    return BadRequest("Variant details not found");
                }

                var totalAmount = variant.Price * request.Quantity;

                // Create order first (without payment details)
                var order = new Order
                {
                    Id = Guid.NewGuid(),
                    BuyerId = request.BuyerId,
                    ProductId = request.ProductId,
                    VariantId = request.VariantId,
                    Quantity = request.Quantity,
                    UnitPrice = variant.Price,
                    TotalAmount = totalAmount,
                    SellerId = product.SellerId,
                    Status = "Pending",
                    PaymentStatus = "INITIATED",
                    OrderDate = DateTime.UtcNow,
                    ShippingAddress = request.ShippingAddress
                };

                // Generate unique Cashfree order ID (max 50 chars)
                var cashfreeOrderId = $"ORD_{DateTime.UtcNow:yyyyMMddHHmmss}_{order.Id.ToString()[..8]}";
                order.CashfreeOrderId = cashfreeOrderId;

                // Create Cashfree order using the service
                var cashfreeOrderRequest = new
                {
                    order_id = cashfreeOrderId,
                    order_amount = totalAmount,
                    order_currency = "INR",
                    customer_details = new
                    {
                        customer_id = request.BuyerId,
                        customer_name = request.CustomerName ?? "Customer",
                        customer_email = request.CustomerEmail ?? "customer@example.com",
                        customer_phone = request.CustomerPhone ?? "9999999999"
                    },
                    order_meta = new
                    {
                        return_url = $"{Request.Scheme}://{Request.Host}/payment-success"
                    }
                };

                // Call Cashfree API to create order and get payment session
                var cashfreeResponse = await _cashfreeService.CreateOrderAsync(cashfreeOrderRequest);
                
                if (cashfreeResponse == null || string.IsNullOrEmpty(cashfreeResponse.PaymentSessionId))
                {
                    return StatusCode(500, "Failed to create Cashfree payment session");
                }

                // Update order with payment session details
                order.PaymentId = cashfreeResponse.PaymentSessionId;
                order.PaymentReference = cashfreeResponse.OrderId;

                // Save order to database
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Order created with ID: {order.Id}, Cashfree Order ID: {cashfreeOrderId}, Payment Session: {cashfreeResponse.PaymentSessionId}");

                // Return payment session details for frontend
                return Ok(new
                {
                    orderId = order.Id,
                    cashfreeOrderId = cashfreeOrderId,
                    paymentSessionId = cashfreeResponse.PaymentSessionId,
                    orderAmount = totalAmount,
                    orderCurrency = "INR",
                    customerDetails = new
                    {
                        customerId = request.BuyerId,
                        customerName = request.CustomerName ?? "Customer",
                        customerEmail = request.CustomerEmail ?? "customer@example.com",
                        customerPhone = request.CustomerPhone ?? "9999999999"
                    },
                    returnUrl = $"{Request.Scheme}://{Request.Host}/payment-success",
                    // Add callback URL for payment status updates
                    callbackUrl = $"{Request.Scheme}://{Request.Host}/api/Order/payment-callback"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating payment order: {ex.Message}");
            }
        }

        // GET: api/Order/payment-success
        [HttpGet("payment-success")]
        public async Task<IActionResult> PaymentSuccess(string order_id, string order_token)
        {
            try
            {
                Console.WriteLine($"Payment success callback: order_id={order_id}, order_token={order_token}");
                
                // Find ALL orders by Cashfree order ID (for bulk orders)
                var orders = await _context.Orders.Where(o => o.CashfreeOrderId == order_id).ToListAsync();
                if (!orders.Any())
                {
                    Console.WriteLine($"No orders found for Cashfree order ID: {order_id}");
                    return BadRequest("Order not found");
                }

                // Update all orders with the same Cashfree order ID
                foreach (var order in orders)
                {
                    order.PaymentStatus = "SUCCESS";
                    order.PaymentDate = DateTime.UtcNow;
                    order.Status = "Processed";
                    order.ProcessedAt = DateTime.UtcNow;
                    order.PaymentId = order_token; // Use token as payment ID

                    // Update product stock for each order
                    var product = await _context.Products.FindAsync(order.ProductId);
                    if (product != null)
                    {
                        var variant = GetVariantDetails(product, order.VariantId);
                        if (variant != null && int.TryParse(variant.Stock, out int variantStock))
                        {
                            variant.Stock = (variantStock - order.Quantity).ToString();
                            product.Variants = product.Variants; // Trigger update
                        }
                    }
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"{orders.Count} orders marked as successful for Cashfree order ID: {order_id}");

                // Redirect to frontend success page
                var primaryOrder = orders.First();
                return Redirect($"http://localhost:5173/order-success?orderId={primaryOrder.Id}&paymentId={order_token}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in payment success: {ex.Message}");
                return StatusCode(500, $"Error processing payment success: {ex.Message}");
            }
        }

        // POST: api/Order/payment-webhook
        [HttpPost("payment-webhook")]
        public async Task<IActionResult> PaymentWebhook([FromBody] dynamic webhookData)
        {
            try
            {
                // Parse webhook data from Cashfree
                var webhookJson = webhookData.ToString();
                var webhookObj = JsonSerializer.Deserialize<JsonElement>(webhookJson);

                if (webhookObj.TryGetProperty("data", out JsonElement dataElement))
                {
                    var orderData = dataElement.GetProperty("order");
                    var orderId = orderData.GetProperty("order_id").GetString();
                    var orderStatus = orderData.GetProperty("order_status").GetString();

                    if (orderData.TryGetProperty("payments", out var paymentsElement) && paymentsElement.ValueKind == JsonValueKind.Array)
                    {
                        var payments = paymentsElement.EnumerateArray();
                        var payment = payments.FirstOrDefault();

                        if (payment.ValueKind != JsonValueKind.Undefined)
                        {
                            var paymentId = payment.GetProperty("cf_payment_id").GetString();
                            var paymentStatus = payment.GetProperty("payment_status").GetString();
                            var paymentMethod = payment.GetProperty("payment_method").GetString();

                            // Find ALL orders by Cashfree order ID (for bulk orders)
                            var orders = await _context.Orders.Where(o => o.CashfreeOrderId == orderId).ToListAsync();
                            if (orders.Any())
                            {
                                foreach (var order in orders)
                                {
                                    order.PaymentId = paymentId;
                                    order.PaymentStatus = paymentStatus;
                                    order.PaymentMethod = paymentMethod;
                                    order.PaymentDate = DateTime.UtcNow;

                                    if (paymentStatus == "SUCCESS")
                                    {
                                        order.Status = "Processed";
                                        order.ProcessedAt = DateTime.UtcNow;

                                        // Update product stock for each order
                                        var product = await _context.Products.FindAsync(order.ProductId);
                                        if (product != null)
                                        {
                                            var variant = GetVariantDetails(product, order.VariantId);
                                            if (variant != null && int.TryParse(variant.Stock, out int variantStock))
                                            {
                                                variant.Stock = (variantStock - order.Quantity).ToString();
                                                product.Variants = product.Variants; // Trigger update
                                            }
                                        }
                                    }
                                }

                                await _context.SaveChangesAsync();
                                Console.WriteLine($"Updated {orders.Count} orders for Cashfree order ID: {orderId} with status: {paymentStatus}");
                            }
                        }
                    }
                }

                return Ok("Webhook processed");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing webhook: {ex.Message}");
            }
        }

        // POST: api/Order/payment-callback
        [HttpPost("payment-callback")]
        public async Task<IActionResult> PaymentCallback([FromBody] PaymentCallbackRequest request)
        {
            try
            {
                Console.WriteLine($"Payment callback received for order: {request.OrderId}");
                
                // Find the order
                var order = await _context.Orders.FindAsync(request.OrderId);
                if (order == null)
                {
                    return BadRequest("Order not found");
                }

                // Check if this order has a Cashfree order ID (for bulk orders)
                List<Order> ordersToUpdate;
                if (!string.IsNullOrEmpty(order.CashfreeOrderId))
                {
                    // Find ALL orders with the same Cashfree order ID (bulk order case)
                    ordersToUpdate = await _context.Orders
                        .Where(o => o.CashfreeOrderId == order.CashfreeOrderId)
                        .ToListAsync();
                    Console.WriteLine($"Found {ordersToUpdate.Count} orders with Cashfree order ID: {order.CashfreeOrderId}");
                }
                                 else
                 {
                     // Single order case
                     ordersToUpdate = new List<Order> { order };
                 }

                // Update payment status for all related orders
                foreach (var orderToUpdate in ordersToUpdate)
                {
                    orderToUpdate.PaymentStatus = "SUCCESS";
                    orderToUpdate.PaymentDate = DateTime.UtcNow;
                    orderToUpdate.Status = "Processed";
                    orderToUpdate.ProcessedAt = DateTime.UtcNow;
                    orderToUpdate.PaymentId = request.PaymentId ?? "CASHFREE_PAYMENT";
                    
                    // Update product stock for each order
                    var product = await _context.Products.FindAsync(orderToUpdate.ProductId);
                    if (product != null)
                    {
                        var variant = GetVariantDetails(product, orderToUpdate.VariantId);
                        if (variant != null && int.TryParse(variant.Stock, out int variantStock))
                        {
                            variant.Stock = Math.Max(0, variantStock - orderToUpdate.Quantity).ToString();
                            product.Variants = product.Variants; // Trigger update
                        }
                    }
                }

                await _context.SaveChangesAsync();
                
                Console.WriteLine($"{ordersToUpdate.Count} order(s) payment status updated to SUCCESS");
                
                return Ok(new { 
                    message = "Payment status updated successfully",
                    ordersUpdated = ordersToUpdate.Count,
                    orderIds = ordersToUpdate.Select(o => o.Id).ToList(),
                    paymentStatus = "SUCCESS",
                    orderStatus = "Processed"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in payment callback: {ex.Message}");
                return StatusCode(500, $"Error updating payment status: {ex.Message}");
            }
        }

        // GET: api/Order/payment-status/{orderId}
        [HttpGet("payment-status/{orderId}")]
        public async Task<IActionResult> GetPaymentStatus(Guid orderId)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                    return NotFound("Order not found");

                if (!string.IsNullOrEmpty(order.CashfreeOrderId))
                {
                    var paymentStatus = await _cashfreeService.GetPaymentStatusAsync(order.CashfreeOrderId);
                    if (paymentStatus != null)
                    {
                        // Update ALL orders with the same Cashfree order ID (for bulk orders)
                        var relatedOrders = await _context.Orders
                            .Where(o => o.CashfreeOrderId == order.CashfreeOrderId)
                            .ToListAsync();

                        foreach (var relatedOrder in relatedOrders)
                        {
                            relatedOrder.PaymentStatus = paymentStatus.payment_status;
                            relatedOrder.PaymentMethod = paymentStatus.payment_method;
                            if (paymentStatus.payment_status == "SUCCESS")
                            {
                                relatedOrder.PaymentDate = paymentStatus.payment_time;
                                relatedOrder.Status = "Processed";
                                relatedOrder.ProcessedAt = DateTime.UtcNow;
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new
                {
                    orderId = order.Id,
                    paymentId = order.PaymentId,
                    paymentStatus = order.PaymentStatus,
                    orderStatus = order.Status,
                    totalAmount = order.TotalAmount,
                    paymentMethod = order.PaymentMethod,
                    paymentDate = order.PaymentDate,
                    cashfreeOrderId = order.CashfreeOrderId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting payment status: {ex.Message}");
            }
        }

        // Debug endpoint to check orders count
        [HttpGet("debug/count")]
        public async Task<IActionResult> GetOrdersCount()
        {
            try
            {
                var count = await _context.Orders.CountAsync();
                var recentOrders = await _context.Orders
                    .OrderByDescending(o => o.OrderDate)
                    .Take(5)
                    .Select(o => new { o.Id, o.Status, o.OrderDate, o.PaymentStatus, o.CashfreeOrderId })
                    .ToListAsync();
                
                return Ok(new { 
                    totalOrders = count, 
                    recentOrders = recentOrders,
                    message = $"Database has {count} orders" 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.Product)
                    .ToListAsync();

                Console.WriteLine($"Found {orders.Count} orders in database");

                // Enrich orders with variant details and calculate total amount
                var enrichedOrders = orders.Select(order => {
                    Product? product = null;
                    ProductVariant? variant = null;
                    string productName = "Error loading product";
                    
                    try
                    {
                        product = order.Product;
                        productName = order.Product?.Name ?? "Unknown Product";
                        variant = GetVariantDetails(order.Product, order.VariantId);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing order {order.Id}: {ex.Message}");
                    }

                    return new
                    {
                        order.Id,
                        order.BuyerId,
                        order.ProductId,
                        order.VariantId,
                        order.Quantity,
                        order.UnitPrice,
                        TotalAmount = order.UnitPrice * order.Quantity,
                        order.SellerId,
                        order.Status,
                        order.OrderDate,
                        order.ProcessedAt,
                        order.ShippingAddress,
                        order.PaymentStatus,
                        order.PaymentId,
                        order.CashfreeOrderId,
                        ProductName = productName,
                        Product = product,
                        Variant = variant
                    };
                }).ToList();

                return Ok(enrichedOrders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllOrders: {ex.Message}");
                return StatusCode(500, $"Error fetching orders: {ex.Message}");
            }
        }

        // GET: api/Order/buyer/{buyerId}
        [HttpGet("buyer/{buyerId}")]
        public async Task<IActionResult> GetOrdersByBuyer(string buyerId)
        {
            var orders = await _context.Orders
                .Where(o => o.BuyerId == buyerId)
                .Include(o => o.Product)
                .ToListAsync();

            // Enrich orders with variant details and calculate total amount
            var enrichedOrders = orders.Select(order => new
            {
                order.Id,
                order.BuyerId,
                order.ProductId,
                order.VariantId,
                order.Quantity,
                order.UnitPrice,
                TotalAmount = order.UnitPrice * order.Quantity, // Calculate total amount
                order.SellerId,
                order.Status,
                order.OrderDate,
                order.ProcessedAt,
                order.ShippingAddress,
                ProductName = order.Product?.Name, // Include product name
                Product = order.Product,
                Variant = GetVariantDetails(order.Product, order.VariantId)
            }).ToList();

            return Ok(enrichedOrders);
        }

        // GET: api/Order/seller/{sellerId}
        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetOrdersBySeller(string sellerId)
        {
            var orders = await _context.Orders
                .Where(o => o.SellerId == sellerId)
                .Include(o => o.Product)
                .ToListAsync();

            // Enrich orders with variant details and calculate total amount
            var enrichedOrders = orders.Select(order => new
            {
                order.Id,
                order.BuyerId,
                order.ProductId,
                order.VariantId,
                order.Quantity,
                order.UnitPrice,
                TotalAmount = order.UnitPrice * order.Quantity, // Calculate total amount
                order.SellerId,
                order.Status,
                order.OrderDate,
                order.ProcessedAt,
                order.ShippingAddress,
                ProductName = order.Product?.Name, // Include product name
                Product = order.Product,
                Variant = GetVariantDetails(order.Product, order.VariantId)
            }).ToList();

            return Ok(enrichedOrders);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] string newStatus)
        {
            if (string.IsNullOrWhiteSpace(newStatus))
                return BadRequest("Status is required.");

            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound("Order not found.");

            var validStatuses = new[] { "Pending", "Processed", "Shipped", "Delivered", "Cancelled" };
            if (!validStatuses.Contains(newStatus))
                return BadRequest("Invalid status.");

            order.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully.", status = newStatus });
        }

        [HttpDelete("seller/{sellerId}/all")]
        public async Task<IActionResult> DeleteAllOrdersBySeller(string sellerId)
        {
            var orders = await _context.Orders
                .Where(o => o.SellerId == sellerId)
                .ToListAsync();

            if (orders.Count == 0)
                return NotFound("No orders found for the specified seller.");

            _context.Orders.RemoveRange(orders);
            await _context.SaveChangesAsync();

            return Ok("All orders for the seller have been deleted.");
        }

        [HttpDelete("all")]
        public async Task<IActionResult> DeleteAllOrders()
        {
            var orders = await _context.Orders.ToListAsync();

            if (orders.Count == 0)
                return NotFound("No orders found.");

            _context.Orders.RemoveRange(orders);
            await _context.SaveChangesAsync();

            return Ok("All orders have been deleted.");
        }

        // Helper method to validate if variant exists within a product
        private async Task<bool> IsValidVariant(Guid productId, Guid variantId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return false;

            try
            {
                if (string.IsNullOrWhiteSpace(product.VariantsJson))
                    return false;

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var variants = JsonSerializer.Deserialize<List<ProductVariant>>(product.VariantsJson, options);
                
                return variants?.Any(v => v.Id == variantId) ?? false;
            }
            catch
            {
                return false; // If JSON is corrupted, consider variant invalid
            }
        }

        // Helper method to get variant details
        private ProductVariant? GetVariantDetails(Product? product, Guid variantId)
        {
            try
            {
                if (product == null || string.IsNullOrWhiteSpace(product.VariantsJson))
                    return null;

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var variants = JsonSerializer.Deserialize<List<ProductVariant>>(product.VariantsJson, options);
                
                return variants?.FirstOrDefault(v => v.Id == variantId);
            }
            catch
            {
                return null;
            }
        }
    }

    // Request model for creating payment orders
    public class CreatePaymentOrderRequest
    {
        public string BuyerId { get; set; }
        public Guid ProductId { get; set; }
        public Guid VariantId { get; set; }
        public int Quantity { get; set; }
        public string ShippingAddress { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
    }

    public class CreateBulkPaymentOrderRequest
    {
        public string BuyerId { get; set; }
        public List<BulkOrderItem> OrderItems { get; set; }
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
    }

    public class BulkOrderItem
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public Guid VariantId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string SellerId { get; set; }
    }

    public class PaymentCallbackRequest
    {
        public Guid OrderId { get; set; }
        public string? PaymentId { get; set; }
        public string PaymentStatus { get; set; } = "SUCCESS";
        public string? PaymentMethod { get; set; }
    }
}
