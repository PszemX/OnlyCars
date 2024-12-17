using System.Security.Claims;
using System.Text;
using backend.Dtos;
using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        private readonly IMongoCollection<Post> _postsCollection;
        private IConfiguration _config;

        public UserController(UserRepository userRepository, IMongoDatabase database, IConfiguration config)
        {
            _userRepository = userRepository;
            _postsCollection = database.GetCollection<Post>("Posts");
            _config = config;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return Ok(users);
        }

        [Authorize]
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");
            return Ok(user);
        }

        [Authorize]
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            var currentUserDto = new CurrentUserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                TokenBalance = user.TokenBalance,
                FollowingUserIds = user.FollowingIds,
                LikedPostIds = user.LikedPostIds,
                PurchasedPostIds = user.PurchasedPostIds,
                ProfilePicture = user.ProfilePicture,
            };

            return Ok(currentUserDto);
        }

        [Authorize]
        [HttpGet("{userId}/info")]
        public async Task<IActionResult> GetUserInfo(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");
            
            var userInfo = new UserInfoDto
            {
                Id = user.Id,
                UserName = user.UserName,
                ProfilePicture = user.ProfilePicture,
                FollowingIds = user.FollowingIds,
                FollowerIds = user.FollowerIds,
                PostIds = user.PostIds,
            };

            return Ok(userInfo);
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDto registrationDto)
        {
            var existingUser = await _userRepository.GetUserByEmailAsync(registrationDto.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Email already exists." });

            var existingUsername = await _userRepository.GetUserByUsernameAsync(registrationDto.UserName);
            if (existingUsername != null)
                return BadRequest(new { message = "Username already exists." });

            var newUser = new User
            {
                UserName = registrationDto.UserName,
                Email = registrationDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password),
                TokenBalance = 0
            };

            await _userRepository.CreateUserAsync(newUser);

            return Ok("Registration successful.");
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "default_key");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.UserName)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { token = tokenString });
        }

        [Authorize]
        [HttpGet("{userId}/posts")]
        public async Task<IActionResult> GetPostsByUser(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            var posts = await _postsCollection.Find(p => user.PostIds.Contains(p.Id)).ToListAsync();

            return Ok(posts);
        }

        [Authorize]
        [HttpGet("{userId}/purchased")]
        public async Task<IActionResult> GetPurchasedPosts(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            var posts = await _postsCollection.Find(p => user.PurchasedPostIds.Contains(p.Id)).ToListAsync();

            return Ok(posts);
        }

        [Authorize]
        [HttpPost("follow/{userToFollowId}")]
        public async Task<IActionResult> FollowUser(string userToFollowId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUserId == null) return Unauthorized();

            var currentUser = await _userRepository.GetUserByIdAsync(currentUserId);
            var userToFollow = await _userRepository.GetUserByIdAsync(userToFollowId);

            if (currentUser == null || userToFollow == null)
                return NotFound("User not found.");
                
            if (currentUserId == userToFollowId)
                return BadRequest("Cannot follow yourself.");
                
            if (currentUser.FollowingIds.Contains(userToFollowId))
                return BadRequest("Already following this user.");

            currentUser.FollowingIds.Add(userToFollowId);
            await _userRepository.UpdateUserAsync(currentUser);

            userToFollow.FollowerIds.Add(currentUserId);
            await _userRepository.UpdateUserAsync(userToFollow);

            return Ok("Successfully followed user.");
        }

        [Authorize]
        [HttpPost("unfollow/{userToUnfollowId}")]
        public async Task<IActionResult> UnfollowUser(string userToUnfollowId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUserId == null) return Unauthorized();

            var currentUser = await _userRepository.GetUserByIdAsync(currentUserId);
            var userToUnfollow = await _userRepository.GetUserByIdAsync(userToUnfollowId);

            if (currentUser == null || userToUnfollow == null) return NotFound("User not found.");
                
            if (!currentUser.FollowingIds.Contains(userToUnfollowId)) return BadRequest("Not following this user.");

            currentUser.FollowingIds.Remove(userToUnfollowId);
            await _userRepository.UpdateUserAsync(currentUser);

            userToUnfollow.FollowerIds.Remove(currentUserId);
            await _userRepository.UpdateUserAsync(userToUnfollow);

            return Ok("Successfully unfollowed user.");
        }

        [Authorize]
        [HttpGet("{userId}/followers")]
        public async Task<IActionResult> GetFollowers(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            var followers = await _userRepository.GetUsersByIdsAsync(user.FollowerIds);
            var followerDtos = followers.Select(f => new FollowUserDto 
            { 
                Id = f.Id, 
                UserName = f.UserName 
            }).ToList();

            return Ok(followerDtos);
        }

        [Authorize]
        [HttpGet("{userId}/following")]
        public async Task<IActionResult> GetFollowing(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            var following = await _userRepository.GetUsersByIdsAsync(user.FollowingIds);
            var followingDtos = following.Select(f => new FollowUserDto 
            { 
                Id = f.Id, 
                UserName = f.UserName 
            }).ToList();

            return Ok(followingDtos);
        }

        [Authorize]
        [HttpPost("profile/picture")]
        public async Task<IActionResult> UpdateProfilePicture([FromBody] string base64Image)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            user.ProfilePicture = Convert.FromBase64String(base64Image);
            await _userRepository.UpdateUserAsync(user);
            
            return Ok("Profile picture updated successfully.");
        }
    }
}
