using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/posts")]
    public class PostController : ControllerBase
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Post> _postsCollection;
        private readonly IMongoCollection<Comment> _commentsCollection;

        public PostController(IMongoDatabase database)
        {
            _usersCollection = database.GetCollection<User>("Users");
            _postsCollection = database.GetCollection<Post>("Posts");
            _commentsCollection = database.GetCollection<Comment>("Comments");
        }

        // TODO: Implement JWT authentication to retrieve userId from token claims

        [HttpPost("{userId}")]
        public async Task<IActionResult> CreatePost(string userId, [FromBody] PostCreationDto postDto)
        {
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound("User not found.");

            var post = new Post
            {
                ImageUrl = postDto.ImageUrl,
                Description = postDto.Description,
                Price = postDto.Price
            };

            await _postsCollection.InsertOneAsync(post);

            user.PostIds.Add(post.Id);
            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);

            return Ok("Post created.");
        }

        [HttpGet("{postId}")]
        public async Task<IActionResult> GetPostById(string postId)
        {
            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound("Post not found.");
            return Ok(post);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPosts()
        {
            var posts = await _postsCollection.Find(_ => true).ToListAsync();
            return Ok(posts);
        }

        [HttpPost("{postId}/comment/{userId}")]
        public async Task<IActionResult> AddComment(string userId, string postId, [FromBody] CommentCreationDto commentDto)
        {
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound("User not found.");

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound("Post not found.");

            var comment = new Comment
            {
                Text = commentDto.Text,
                UserId = userId
            };

            await _commentsCollection.InsertOneAsync(comment);

            post.CommentIds.Add(comment.Id);

            await _postsCollection.ReplaceOneAsync(p => p.Id == post.Id, post);

            return Ok("Comment added.");
        }

        [HttpPost("{postId}/like/{userId}")]
        public async Task<IActionResult> LikePost(string userId, string postId)
        {
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound("User not found.");

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound("Post not found.");

            if (!user.LikedPostIds.Contains(postId))
            {
                user.LikedPostIds.Add(postId);
                await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
            }

            return Ok("Post liked.");
        }

        [HttpPost("{postId}/purchase/{userId}")]
        public async Task<IActionResult> PurchasePost(string userId, string postId)
        {
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound("User not found.");

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound("Post not found.");

            if (user.TokenBalance < post.Price)
                return BadRequest("Insufficient tokens.");

            user.TokenBalance -= post.Price;

            if (!user.PurchasedPostIds.Contains(postId))
            {
                user.PurchasedPostIds.Add(postId);
            }

            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
        
            return Ok("Post unlocked.");
        }

        [HttpGet("{postId}/comments")]
        public async Task<IActionResult> GetCommentsByPost(string postId)
        {
            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound("Post not found.");

            var comments = await _commentsCollection.Find(c => post.CommentIds.Contains(c.Id)).ToListAsync();

            return Ok(comments);
        }
    }
}
