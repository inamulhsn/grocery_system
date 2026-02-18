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
                sale.CreatedAt = DateTime.UtcNow;
                _context.Sales.Add(sale);

                // 2. Process Items and Deduct Stock
                foreach (var item in sale.Items)
                {
                    if (string.IsNullOrWhiteSpace(item.ProductId))
                    {
                        return BadRequest("Each sale item must have a valid ProductId.");
                    }

                    // Find the product in the database
                    var product = await _context.Products.FindAsync(item.ProductId);

                    if (product == null)
                    {
                        return BadRequest($"Product not found for item with ProductId: {item.ProductId}");
                    }

                    // Check stock
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