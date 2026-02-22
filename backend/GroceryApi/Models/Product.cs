using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GroceryApi.Models; // for Supplier reference

namespace GroceryApi.Models
{
    public class Product
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Sku { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal CostPrice { get; set; }
        
        public int StockQuantity { get; set; }
        public int RefillThreshold { get; set; }
        public string Unit { get; set; } = "pcs";
        public double DiscountPercentage { get; set; }
        public string BarcodeUrl { get; set; }

        // encoded string containing full product details; printed on barcode label
        public string BarcodeValue { get; set; } = string.Empty;

        // new supplier reference
        public string? SupplierId { get; set; }
        public Supplier? Supplier { get; set; }
    }
}