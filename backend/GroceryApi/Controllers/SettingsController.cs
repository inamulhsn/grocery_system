using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryApi.Data;
using GroceryApi.Models;

namespace GroceryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly GroceryContext _context;

        public SettingsController(GroceryContext context)
        {
            _context = context;
        }

        // GET: api/Settings/branding
        [HttpGet("branding")]
        public async Task<ActionResult<SystemSettings>> GetBranding()
        {
            var settings = await _context.SystemSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                // Return default if not found
                return new SystemSettings(); 
            }
            return settings;
        }

        // POST: api/Settings/branding
        [HttpPost("branding")]
        public async Task<ActionResult<SystemSettings>> UpdateBranding(SystemSettings settings)
        {
            var existing = await _context.SystemSettings.FirstOrDefaultAsync();
            if (existing == null)
            {
                settings.Id = 1; // Force ID 1
                _context.SystemSettings.Add(settings);
            }
            else
            {
                existing.SystemName = settings.SystemName;
                existing.LogoUrl = settings.LogoUrl;
            }
            await _context.SaveChangesAsync();
            return settings;
        }
        
        // GET: api/Settings/features
        [HttpGet("features")]
        public async Task<ActionResult<FeatureToggles>> GetFeatures()
        {
            var features = await _context.FeatureToggles.FirstOrDefaultAsync();
            if (features == null) return new FeatureToggles();
            return features;
        }

        // POST: api/Settings/features
        [HttpPost("features")]
        public async Task<ActionResult<FeatureToggles>> UpdateFeatures(FeatureToggles features)
        {
            var existing = await _context.FeatureToggles.FirstOrDefaultAsync();
            if (existing == null)
            {
                features.Id = 1;
                _context.FeatureToggles.Add(features);
            }
            else
            {
                existing.ShowProfitMargin = features.ShowProfitMargin;
                existing.EnableBarcodePrinting = features.EnableBarcodePrinting;
                existing.AllowPendingBills = features.AllowPendingBills;
            }
            await _context.SaveChangesAsync();
            return features;
        }
    }
}