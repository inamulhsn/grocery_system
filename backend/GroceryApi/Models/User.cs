using System;
using System.ComponentModel.DataAnnotations;

namespace GroceryApi.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Username { get; set; }
        public string Password { get; set; } // In a real app, hash this!
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; } // "admin", "cashier", "manager"
        
        // We store the permissions as a JSON string to keep it simple
        public string PermissionsJson { get; set; }

        /// <summary>Admin/staff contact number (e.g. for SMS alerts).</summary>
        public string PhoneNumber { get; set; } 
    }
}