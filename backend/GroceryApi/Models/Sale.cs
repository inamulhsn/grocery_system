using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GroceryApi.Models
{
    public class Sale
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime CreatedAt { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }
        
        public string PaymentMethod { get; set; } = "cash"; 
        public string CashierId { get; set; } = "admin";

        /// <summary>Optional. Set when sale is linked to a known customer.</summary>
        public string CustomerId { get; set; }
        /// <summary>Display name for receipt and sales list. If empty, show as "Customer".</summary>
        public string CustomerName { get; set; }
        /// <summary>Customer mobile number for the sale.</summary>
        public string CustomerPhone { get; set; }

        public List<SaleItem> Items { get; set; } = new List<SaleItem>();
    }

    public class SaleItem
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SaleId { get; set; }
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }
    }
}