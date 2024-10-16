using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserRepository _userRepository;

        public UserController(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // Get all users
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return Ok(users);
        }


        // Register new user
        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            // Check if the user already exists by email
            var existingUser = await _userRepository.GetUserByEmailAsync(user.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Email already exists." });

            // Check if the user already exists by username
            var existingUsername = await _userRepository.GetUserByUsernameAsync(user.UserName);
            if (existingUsername != null)
                return BadRequest(new { message = "Username already exists." });

            // Hash the password before storing it in the database
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

            // Set default token balance for new users
            user.TokenBalance = 100;

            // Create the user in the database
            await _userRepository.CreateUserAsync(user);

            return Ok("Registration successful.");
        }


        // Login user
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            try
            {
                // Find user by email
                var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);

                // Check if the user exists and the password matches
                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                // Placeholder for generating and returning a JWT token (TODO later)
                return Ok(new { message = "Login successful." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", details = ex.Message });
            }
        }
    }

    // DTO (Data Transfer Object) for handling login requests
    public class UserLoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
