namespace Backend.Models
{
    public class CashfreeConfig
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string BaseUrl { get; set; } = "https://sandbox.cashfree.com"; // Use https://api.cashfree.com for production
        public string Version { get; set; } = "2023-08-01";
        public string ReturnUrl { get; set; }
        public string NotifyUrl { get; set; }
    }

    public class CashfreeOrderRequest
    {
        public string order_id { get; set; }
        public decimal order_amount { get; set; }
        public string order_currency { get; set; } = "INR";
        public CashfreeCustomer customer_details { get; set; }
        public CashfreeOrderMeta order_meta { get; set; }
    }

    public class CashfreeCustomer
    {
        public string customer_id { get; set; }
        public string customer_name { get; set; }
        public string customer_email { get; set; }
        public string customer_phone { get; set; }
    }

    public class CashfreeOrderMeta
    {
        public string return_url { get; set; }
        public string notify_url { get; set; }
        public string payment_methods { get; set; }
    }

    public class CashfreeOrderResponse
    {
        public string cf_order_id { get; set; }
        public string order_id { get; set; }
        public string entity { get; set; }
        public decimal order_amount { get; set; }
        public string order_currency { get; set; }
        public string order_status { get; set; }
        public string payment_session_id { get; set; }
        public string order_expiry_time { get; set; }
        public DateTime created_at { get; set; }
        public CashfreeCustomer customer_details { get; set; }
        public CashfreeOrderMeta order_meta { get; set; }

        // Properties for easier access
        public string PaymentSessionId => payment_session_id;
        public string OrderId => order_id;
    }

    public class PaymentStatusResponse
    {
        public string cf_payment_id { get; set; }
        public string order_id { get; set; }
        public string entity { get; set; }
        public decimal payment_amount { get; set; }
        public string payment_currency { get; set; }
        public string payment_status { get; set; }
        public string payment_method { get; set; }
        public DateTime payment_time { get; set; }
        public string utr { get; set; }
    }
} 