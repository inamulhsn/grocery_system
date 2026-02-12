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

        // POST: api/Sales
        [HttpPost]
        public async Task<ActionResult<Sale>> PostSale(Sale sale)
        {
            // Start a transaction to ensure data integrity
            using var transaction = _context.Database.BeginTransaction();

            try
            {
                // 1. Save the Sale
                sale.CreatedAt = DateTime.UtcNow;
                _context.Sales.Add(sale);

                // 2. Process Items and Deduct Stock
                foreach (var item in sale.Items)
                {
                    // Find the product in the database
                    var product = await _context.Products.FindAsync(item.ProductId);

                    if (product != null)
                    {
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
                }

                // 3. Save everything
                await _context.SaveChangesAsync();
                
                // 4. Commit transaction
                transaction.Commit();

                return CreatedAtAction("GetSales", new { id = sale.Id }, sale);
            }
            catch (Exception ex)
            {
                // If anything goes wrong, undo everything
                transaction.Rollback();
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}