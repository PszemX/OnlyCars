using System.Security.Claims;
using System.Text;
using backend.Dtos;
using backend.Models;
using backend.Helpers;
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
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Post> _postsCollection;
        private readonly IMongoCollection<Comment> _commentsCollection;
        private IConfiguration _config;
        private readonly CloudflareStorageService _storage;

        public UserController(UserRepository userRepository, IMongoDatabase database, IConfiguration config, CloudflareStorageService storage)
        {
            _userRepository = userRepository;
            _usersCollection = database.GetCollection<User>("Users");
            _postsCollection = database.GetCollection<Post>("Posts");
            _commentsCollection = database.GetCollection<Comment>("Comments");
            _config = config;
            _storage = storage;            
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
            if (user == null) return NotFound(new { message = "User not found." });
            return Ok(user);
        }

        [Authorize]
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var currentUserDto = new CurrentUserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Description = user.Description,
                TokenBalance = user.TokenBalance,
                FollowingUserIds = user.FollowingIds,
                LikedPostIds = user.LikedPostIds,
                PurchasedPostIds = user.PurchasedPostIds,
                ProfilePictureUrl = user.ProfilePictureUrl
            };

            return Ok(currentUserDto);
        }

        [Authorize]
        [HttpGet("{userId}/info")]
        public async Task<IActionResult> GetUserInfo(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });
            
            var userInfo = new UserInfoDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Description = user.Description,
                ProfilePictureUrl = user.ProfilePictureUrl,
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

            return Ok(new { message = "Registration successful." });
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
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim("IsAdmin", user.IsAdmin.ToString().ToLower())
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
            if (user == null) return NotFound(new { message = "User not found." });

            var posts = await _postsCollection.Find(p => user.PostIds.Contains(p.Id)).ToListAsync();

            return Ok(posts);
        }

        [Authorize]
        [HttpGet("{userId}/purchased")]
        public async Task<IActionResult> GetPurchasedPosts(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

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
                return NotFound(new { message = "User not found." });
                
            if (currentUserId == userToFollowId)
                return BadRequest(new { message = "Cannot follow yourself." });
                
            if (currentUser.FollowingIds.Contains(userToFollowId))
                return BadRequest(new { message = "Already following this user." });

            currentUser.FollowingIds.Add(userToFollowId);
            await _userRepository.UpdateUserAsync(currentUser);

            userToFollow.FollowerIds.Add(currentUserId);
            await _userRepository.UpdateUserAsync(userToFollow);

            return Ok(new { message = "Successfully followed user." });
        }

        [Authorize]
        [HttpPost("unfollow/{userToUnfollowId}")]
        public async Task<IActionResult> UnfollowUser(string userToUnfollowId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUserId == null) return Unauthorized();

            var currentUser = await _userRepository.GetUserByIdAsync(currentUserId);
            var userToUnfollow = await _userRepository.GetUserByIdAsync(userToUnfollowId);

            if (currentUser == null || userToUnfollow == null) return NotFound(new { message = "User not found." });
                
            if (!currentUser.FollowingIds.Contains(userToUnfollowId)) return BadRequest(new { message = "Not following this user." });

            currentUser.FollowingIds.Remove(userToUnfollowId);
            await _userRepository.UpdateUserAsync(currentUser);

            userToUnfollow.FollowerIds.Remove(currentUserId);
            await _userRepository.UpdateUserAsync(userToUnfollow);

            return Ok(new { message = "Successfully unfollowed user." });
        }

        [Authorize]
        [HttpGet("{userId}/followers")]
        public async Task<IActionResult> GetFollowers(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

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
            if (user == null) return NotFound(new { message = "User not found." });

            var following = await _userRepository.GetUsersByIdsAsync(user.FollowingIds);
            var followingDtos = following.Select(f => new FollowUserDto 
            { 
                Id = f.Id, 
                UserName = f.UserName 
            }).ToList();

            return Ok(followingDtos);
        }

        [Authorize]
        [HttpPatch("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UserUpdateDto updateDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var user = await _userRepository.GetUserByIdAsync(userId);
            
            if (user == null) return NotFound(new { message = "User not found." });

            if (!BCrypt.Net.BCrypt.Verify(updateDto.Password, user.PasswordHash))
                return BadRequest(new { message = "Incorrect password." });

            var update = Builders<User>.Update;
            var updateDefinition = new List<UpdateDefinition<User>>();

            if (!string.IsNullOrEmpty(updateDto.UserName) && updateDto.UserName != user.UserName)
            {
                var existingUser = await _userRepository.GetUserByUsernameAsync(updateDto.UserName);
                if (existingUser != null) return BadRequest(new { message = "Username already exists." });

                updateDefinition.Add(update.Set(u => u.UserName, updateDto.UserName));
            }

            if (!string.IsNullOrEmpty(updateDto.NewPassword))
            {
                var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.NewPassword);
                updateDefinition.Add(update.Set(u => u.PasswordHash, newPasswordHash));
            }

            if (updateDto.Description != null)
            {
                updateDefinition.Add(update.Set(u => u.Description, updateDto.Description));
            }

            if (!string.IsNullOrEmpty(updateDto.WalletAddress))
            {
                updateDefinition.Add(update.Set(u => u.WalletAddress, updateDto.WalletAddress));
            }

             if (updateDto.ProfilePicture != null)
            {
                if (!ImageHelper.IsValidImage(updateDto.ProfilePicture))
                    return BadRequest(new { message = "Invalid image format" });

                if (!ImageHelper.IsValidImageSize(updateDto.ProfilePicture))
                    return BadRequest(new { message = "Profile picture is too large" });

                if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
                {
                    await _storage.DeleteImageAsync(user.ProfilePictureUrl);
                }

                var imageUrl = await _storage.UploadImageAsync(updateDto.ProfilePicture);
                updateDefinition.Add(update.Set(u => u.ProfilePictureUrl, imageUrl));
            }

            if (updateDefinition.Count > 0)
            {
                var combinedUpdate = update.Combine(updateDefinition);
                await _usersCollection.UpdateOneAsync(u => u.Id == userId, combinedUpdate);
                
                return Ok(new { message = "User updated succesfully." });
            }

            return BadRequest(new { message = "No updates provided." });
        }

        [Authorize]
        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest(new { message = "Username search term is required." });
                
            var filter = Builders<User>.Filter.Regex(u => u.UserName, 
                new MongoDB.Bson.BsonRegularExpression(username, "i"));
            var users = await _usersCollection.Find(filter).ToListAsync();
            
            var userDtos = users.Select(u => new FollowUserDto 
            { 
                Id = u.Id, 
                UserName = u.UserName 
            }).ToList();
            
            return Ok(userDtos);
        } 

        [Authorize]
        [HttpGet("{userId}/comments")]
        public async Task<IActionResult> GetUserComments(string userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var comments = await _commentsCollection.Find(c => c.UserId == userId)
                .SortByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(comments);
        }
    }
}
