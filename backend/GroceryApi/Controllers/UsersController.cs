using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryApi.Data;
using GroceryApi.Models;
using System;

namespace GroceryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly GroceryContext _context;

        public UsersController(GroceryContext context)
        {
            _context = context;
        }

        [HttpGet("create-admin")]
        public async Task<ActionResult> CreateAdmin()
        {
            // 1. Check if an admin already exists so we don't create duplicates
            var exists = await _context.Users.AnyAsync(u => u.Username == "admin");
            if (exists) return Ok("Admin user already exists in Postgres!");

            // 2. Define the Admin credentials
            var admin = new GroceryApi.Models.User
            {
                Id = Guid.NewGuid().ToString(), // Generates a unique ID
                Username = "admin",
                Password = "123", // This is what you'll type in the login box
                Email = "admin@grocerypro.com",
                FullName = "System Administrator",
                Role = "admin",
                PermissionsJson = "{}"
            };

            // 3. Save to PostgreSQL
            _context.Users.Add(admin);
            await _context.SaveChangesAsync();

            return Ok("Success! Admin user (admin/admin) is now saved in your PostgreSQL database.");
        }

        // POST: api/Users/login
        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Identifier || u.Email == request.Identifier);

            if (user == null || user.Password != request.Password)
            {
                return Unauthorized("Invalid credentials");
            }

            return user;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetUsers", new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, User updatedUser)
        {
            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null) return NotFound();

            // Update only the fields sent from the frontend
            existingUser.FullName = updatedUser.FullName;
            existingUser.Email = updatedUser.Email;
            existingUser.Username = updatedUser.Username;
            existingUser.Role = updatedUser.Role;
            existingUser.PermissionsJson = updatedUser.PermissionsJson;
            existingUser.PhoneNumber = updatedUser.PhoneNumber ?? "";

            // Only update password if a new one is provided
            if (!string.IsNullOrEmpty(updatedUser.Password))
            {
                existingUser.Password = updatedUser.Password;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class LoginRequest
    {
        public string Identifier { get; set; }
        public string Password { get; set; }
    }
}