using System;

namespace GroceryApi.Models
{
    public class Supplier
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string WhatsAppNumber { get; set; } = string.Empty;
    }
}
