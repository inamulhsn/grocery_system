using System.ComponentModel.DataAnnotations;

namespace GroceryApi.Models
{
    public class FeatureToggles
    {
        [Key]
        public int Id { get; set; } = 1; // We only need one row
        public bool ShowProfitMargin { get; set; } = true;
        public bool EnableBarcodePrinting { get; set; } = true;
        public bool AllowPendingBills { get; set; } = false;
    }
}