using System.Security.Claims;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using backend.Repositories;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/posts")]
    public class PostController : ControllerBase
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Post> _postsCollection;
        private readonly IMongoCollection<Comment> _commentsCollection;
        private readonly UserRepository _userRepository;

        public PostController(IMongoDatabase database, UserRepository userRepository)
        {
            _usersCollection = database.GetCollection<User>("Users");
            _postsCollection = database.GetCollection<Post>("Posts");
            _commentsCollection = database.GetCollection<Comment>("Comments");
            _userRepository = userRepository;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] PostCreationDto postDto)
        {
            if (postDto.ImagesData.Count > 3) return BadRequest(new { message = "Maximum 3 images allowed." });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound(new { message = "User not found." });

            var post = new Post
            {
                UserId = userId,
                Description = postDto.Description,
                Price = postDto.Price,
                ImagesData = postDto.ImagesData.Select(base64 => Convert.FromBase64String(base64)).ToList()
            };

            await _postsCollection.InsertOneAsync(post);

            user.PostIds.Add(post.Id);
            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);

            return Ok(new { message = "Post created." });
        }

        [HttpGet("{postId}")]
        public async Task<IActionResult> GetPostById(string postId)
        {
            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound(new { message = "User not found." });
            return Ok(post);
        }

        [HttpGet]
        [Route("all")]
        public async Task<IActionResult> GetAllPosts()
        {
            var posts = await _postsCollection.Find(_ => true).ToListAsync();
            return Ok(posts);
        }

        [HttpPost("{postId}/comment")]
        public async Task<IActionResult> AddComment(string postId, [FromBody] CommentCreationDto commentDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound(new { message = "User not found." });

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound(new { message = "Post not found." });

            var comment = new Comment
            {
                Text = commentDto.Text,
                UserId = userId
            };

            await _commentsCollection.InsertOneAsync(comment);

            post.CommentIds.Add(comment.Id);

            await _postsCollection.ReplaceOneAsync(p => p.Id == post.Id, post);

            return Ok(new { message = "Comment added." });
        }

        [HttpPost("{postId}/like")]
        public async Task<IActionResult> LikePost(string postId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound(new { message = "User not found." });

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound(new { message = "Post not found." });

            if (!user.LikedPostIds.Contains(postId))
            {
                user.LikedPostIds.Add(postId);
                await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
            }

            return Ok(new { message = "Post liked." });
        }

        [HttpPost("{postId}/purchase")]
        public async Task<IActionResult> PurchasePost(string postId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound(new { message = "User not found." });

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound(new { message = "Post not found." });

            if (user.TokenBalance < post.Price) return BadRequest(new { message = "Insufficient tokens." });

            user.TokenBalance -= post.Price;

            if (!user.PurchasedPostIds.Contains(postId))
                user.PurchasedPostIds.Add(postId);

            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
        
            return Ok(new { message = "Post unlocked." });
        }

        [HttpGet("{postId}/comments")]
        public async Task<IActionResult> GetCommentsByPost(string postId)
        {
            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound(new { message = "User not found." });

            var comments = await _commentsCollection.Find(c => post.CommentIds.Contains(c.Id)).ToListAsync();

            return Ok(comments);
        }

        [HttpGet("feed")]
        public async Task<IActionResult> GetUserFeed()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var posts = await _postsCollection
                .Find(p => user.FollowingIds.Contains(p.UserId))
                .SortByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(posts);
        }
    }
}
