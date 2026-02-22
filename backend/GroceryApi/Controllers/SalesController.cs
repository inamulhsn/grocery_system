using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryApi.Data;
using GroceryApi.Models;

namespace GroceryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly GroceryContext _context;

        public SalesController(GroceryContext context)
        {
            _context = context;
        }

        // GET: api/Sales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSales()
        {
            // Load sales AND their items
            return await _context.Sales
                .Include(s => s.Items)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }
        
        [HttpGet("daily-total")]
        public async Task<ActionResult<decimal>> GetDailyTotal()
        {
            var today = DateTime.UtcNow.Date;

            // This tells PostgreSQL to sum the 'Total' column for today's records only
            var total = await _context.Sales
                .Where(s => s.CreatedAt.Date == today)
                .SumAsync(s => s.TotalAmount);

            return Ok(total);
        }

        // Return both total revenue and count of sales for today.
        [HttpGet("daily-stats")]
        public async Task<ActionResult<object>> GetDailyStats([FromQuery] string? date)
        {
            // We want stats calculated using Sri Lanka local day (UTC+5:30). The database stores
            // CreatedAt in UTC. To correctly filter, compute the UTC range that corresponds to
            // the SL calendar day and query by that range.
            TimeZoneInfo slZone;
            try
            {
                // Windows id
                slZone = TimeZoneInfo.FindSystemTimeZoneById("Sri Lanka Standard Time");
            }
            catch
            {
                // Linux/macOS id
                slZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Colombo");
            }

            DateTime targetLocal;
            if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var parsed))
            {
                // interpret provided date as Sri Lanka local
                targetLocal = parsed.Date;
            }
            else
            {
                targetLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, slZone).Date;
            }

            // compute the corresponding UTC bounds
            var startUtc = TimeZoneInfo.ConvertTimeToUtc(targetLocal, slZone);
            var endUtc = startUtc.AddDays(1);

            var todaysSalesQuery = _context.Sales
                .Where(s => s.CreatedAt >= startUtc && s.CreatedAt < endUtc);

            var total = await todaysSalesQuery.SumAsync(s => s.TotalAmount);
            var count = await todaysSalesQuery.CountAsync();

            // calculate profit by joining items with product cost prices
            // profit = sum(item.TotalPrice - product.CostPrice * item.Quantity)
            // compute profit joining only when product exists (skip manual items)
            var profit = await todaysSalesQuery
                .SelectMany(s => s.Items)
                .Join(_context.Products,
                      item => item.ProductId,
                      prod => prod.Id,
                      (item, prod) => new { item, prod })
                .SumAsync(x => x.item.TotalPrice - x.prod.CostPrice * x.item.Quantity);

            return Ok(new { total, count, profit });
        }


        // POST: api/Sales
        [HttpPost]
        public async Task<ActionResult<Sale>> PostSale(Sale sale)
        {
            // Start a transaction to ensure data integrity
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                if (sale == null || sale.Items == null || !sale.Items.Any())
                {
                    return BadRequest("Sale must contain at least one item.");
                }

                // 1. Save the Sale
                // Ensure CreatedAt is in UTC and properly marked
                sale.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
                _context.Sales.Add(sale);

                // 2. Process Items and Deduct Stock
                foreach (var item in sale.Items)
                {
                    if (string.IsNullOrWhiteSpace(item.ProductId))
                    {
                        return BadRequest("Each sale item must have a valid ProductId.");
                    }

                    // Find the product in the database. Manual items use a synthetic id and
                    // won't exist; in that case we simply skip stock checks and leave the
                    // sale item as-is. The price/name are already carried in the item.
                    var product = await _context.Products.FindAsync(item.ProductId);

                    if (product == null)
                    {
                        // treat as custom/manual line; don't deduct stock
                        item.SaleId = sale.Id;
                        continue; // move to next item
                    }

                    // Check stock for real products
                    if (product.StockQuantity < item.Quantity)
                    {
                        return BadRequest($"Insufficient stock for item: {product.Name}");
                    }

                    // Deduct stock
                    product.StockQuantity -= item.Quantity;
                    
                    // Link item to sale ID explicitly just in case
                    item.SaleId = sale.Id;
                }

                // 3. Save everything
                await _context.SaveChangesAsync();
                
                // 4. Commit transaction
                await transaction.CommitAsync();

                return CreatedAtAction("GetSales", new { id = sale.Id }, sale);
            }
            catch (Exception ex)
            {
                // If anything goes wrong, undo everything
                await transaction.RollbackAsync();
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}