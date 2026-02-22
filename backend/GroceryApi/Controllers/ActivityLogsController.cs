using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryApi.Data;
using GroceryApi.Models;

namespace GroceryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivityLogsController : ControllerBase
    {
        private readonly GroceryContext _context;
        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        public ActivityLogsController(GroceryContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivityLogs()
        {
            return await _context.ActivityLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(100)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<ActivityLog>> PostActivityLog(ActivityLog log)
        {
            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
            return Ok(log);
        }

        /// <summary>Revert the action recorded in this log (undo), then remove the log entry.</summary>
        [HttpPost("{id}/revert")]
        public async Task<IActionResult> RevertActivityLog(int id)
        {
            var log = await _context.ActivityLogs.FindAsync(id);
            if (log == null) return NotFound();

            try
            {
                switch (log.Action)
                {
                    case "PRODUCT_CREATE":
                        if (!string.IsNullOrEmpty(log.EntityId))
                        {
                            var productToDelete = await _context.Products.FindAsync(log.EntityId);
                            if (productToDelete != null)
                            {
                                _context.Products.Remove(productToDelete);
                            }
                        }
                        break;

                    case "PRODUCT_DELETE":
                        if (!string.IsNullOrEmpty(log.RevertPayload))
                        {
                            var product = JsonSerializer.Deserialize<Product>(log.RevertPayload, JsonOptions);
                            if (product != null)
                            {
                                _context.Products.Add(product);
                            }
                        }
                        break;

                    case "USER_CREATE":
                        if (!string.IsNullOrEmpty(log.EntityId))
                        {
                            var userToDelete = await _context.Users.FindAsync(log.EntityId);
                            if (userToDelete != null)
                            {
                                _context.Users.Remove(userToDelete);
                            }
                        }
                        break;

                    case "USER_DELETE":
                        if (!string.IsNullOrEmpty(log.RevertPayload))
                        {
                            var user = JsonSerializer.Deserialize<User>(log.RevertPayload, JsonOptions);
                            if (user != null)
                            {
                                _context.Users.Add(user);
                            }
                        }
                        break;

                    case "SALE_COMPLETE":
                        if (!string.IsNullOrEmpty(log.EntityId))
                        {
                            var sale = await _context.Sales.Include(s => s.Items).FirstOrDefaultAsync(s => s.Id == log.EntityId);
                            if (sale != null)
                            {
                                foreach (var item in sale.Items)
                                {
                                    var product = await _context.Products.FindAsync(item.ProductId);
                                    if (product != null)
                                        product.StockQuantity += item.Quantity;
                                }
                                _context.SaleItems.RemoveRange(sale.Items);
                                _context.Sales.Remove(sale);
                            }
                        }
                        break;

                    case "BRANDING_UPDATE":
                        if (!string.IsNullOrEmpty(log.RevertPayload))
                        {
                            var settings = JsonSerializer.Deserialize<SystemSettings>(log.RevertPayload, JsonOptions);
                            if (settings != null)
                            {
                                var existing = await _context.SystemSettings.FirstOrDefaultAsync();
                                if (existing != null)
                                {
                                    existing.SystemName = settings.SystemName;
                                    existing.LogoUrl = settings.LogoUrl ?? "";
                                }
                                else
                                {
                                    _context.SystemSettings.Add(settings);
                                }
                            }
                        }
                        break;

                    default:
                        break;
                }

                log.RevertedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Revert failed: " + ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivityLog(int id)
        {
            var log = await _context.ActivityLogs.FindAsync(id);
            if (log == null) return NotFound();
            _context.ActivityLogs.Remove(log);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}