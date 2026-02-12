using System.ComponentModel.DataAnnotations;

namespace GroceryApi.Models
{
    public class SystemSettings
    {
        [Key]
        public int Id { get; set; } = 1; // We only need one row for settings
        public string SystemName { get; set; } = "GroceryPro";
        public string LogoUrl { get; set; } = "";
    }
}