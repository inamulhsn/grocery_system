using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryApi.Data;
using GroceryApi.Models;
using System.Text.RegularExpressions;

namespace GroceryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly GroceryContext _context;

        public CustomersController(GroceryContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return await _context.Customers.ToListAsync();
        }

        [HttpGet("by-phone/{phone}")]
        public async Task<ActionResult<Customer>> GetCustomerByPhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
            {
                return BadRequest("Phone is required.");
            }
            
            try
            {
                // Normalize phone: remove spaces, dashes, parentheses, plus signs, and convert to lowercase
                var normalized = Regex.Replace(phone.Trim(), @"[\s\-\(\)\+]", "").ToLowerInvariant();
                
                if (string.IsNullOrEmpty(normalized))
                {
                    return BadRequest("Invalid phone number format.");
                }
                
                // Get all customers and check normalized phone numbers
                var customers = await _context.Customers.ToListAsync();
                var customer = customers.FirstOrDefault(c => 
                {
                    if (c == null) return false;
                    
                    var mobileNormalized = string.IsNullOrWhiteSpace(c.MobileNumber) 
                        ? string.Empty 
                        : Regex.Replace(c.MobileNumber.Trim(), @"[\s\-\(\)\+]", "").ToLowerInvariant();
                    var whatsappNormalized = string.IsNullOrWhiteSpace(c.WhatsAppNumber) 
                        ? string.Empty 
                        : Regex.Replace(c.WhatsAppNumber.Trim(), @"[\s\-\(\)\+]", "").ToLowerInvariant();
                    
                    return mobileNormalized == normalized || whatsappNormalized == normalized;
                });
                
                if (customer == null)
                {
                    return NotFound();
                }
                
                return customer;
            }
            catch (Exception ex)
            {
                return BadRequest($"Error looking up customer: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(string id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();
            return customer;
        }

        [HttpPost]
        public async Task<ActionResult<Customer>> CreateCustomer(Customer customer)
        {
            if (string.IsNullOrEmpty(customer.Id)) customer.Id = Guid.NewGuid().ToString();
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(string id, Customer updatedCustomer)
        {
            var existing = await _context.Customers.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = updatedCustomer.Name;
            existing.Email = updatedCustomer.Email ?? "";
            existing.Address = updatedCustomer.Address ?? "";
            existing.MobileNumber = updatedCustomer.MobileNumber ?? "";
            existing.WhatsAppNumber = updatedCustomer.WhatsAppNumber ?? "";

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(string id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
