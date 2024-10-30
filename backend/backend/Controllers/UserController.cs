using backend.Dtos;
using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        private readonly IMongoCollection<Post> _postsCollection;

        public UserController(UserRepository userRepository, IMongoDatabase database)
        {
            _userRepository = userRepository;
            _postsCollection = database.GetCollection<Post>("Posts");
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");
            return Ok(user);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDto registrationDto)
        {
            // Check if the email was already used
            var existingUser = await _userRepository.GetUserByEmailAsync(registrationDto.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Email already exists." });

            // Check if the username is taken
            var existingUsername = await _userRepository.GetUserByUsernameAsync(registrationDto.UserName);
            if (existingUsername != null)
                return BadRequest(new { message = "Username already exists." });

            var newUser = new User
            {
                UserName = registrationDto.UserName,
                Email = registrationDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password),
                TokenBalance = 100
            };

            await _userRepository.CreateUserAsync(newUser);

            return Ok("Registration successful.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            try
            {
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

        [HttpGet("{userId}/posts")]
        public async Task<IActionResult> GetPostsByUser(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            var posts = await _postsCollection.Find(p => user.PostIds.Contains(p.Id)).ToListAsync();

            return Ok(posts);
        }

        [HttpGet("{userId}/purchased")]
        public async Task<IActionResult> GetPurchasedPosts(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            var posts = await _postsCollection.Find(p => user.PurchasedPostIds.Contains(p.Id)).ToListAsync();

            return Ok(posts);
        }

    }
}
