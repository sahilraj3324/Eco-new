using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Order
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string BuyerId { get; set; }

        [Required]
        public Guid ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; }

        [Required]
        public Guid VariantId { get; set; }

        [Required]
        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public string? SellerId { get; set; } // Can be pulled from the Product

        public string Status { get; set; } = "Pending"; // Pending, Processed, Shipped, Delivered, Cancelled

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public DateTime? ProcessedAt { get; set; }

        public string? ShippingAddress { get; set; }

        // Payment-related fields for Cashfree integration
        public string? PaymentId { get; set; } // Cashfree Payment ID
        
        public string PaymentStatus { get; set; } = "INITIATED"; // INITIATED, SUCCESS, FAILED, PENDING
        
        public string? CashfreeOrderId { get; set; } // Cashfree Order ID
        
        public decimal TotalAmount { get; set; } // Total amount (UnitPrice * Quantity)
        
        public string? PaymentMethod { get; set; } // Payment method used (UPI, Card, etc.)
        
        public DateTime? PaymentDate { get; set; } // When payment was completed
        
        public string? PaymentReference { get; set; } // Additional payment reference from Cashfree
    }
}
