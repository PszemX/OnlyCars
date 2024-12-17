using System.Security.Claims;
using backend.Dtos;
using backend.Helpers;
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
        private readonly CloudflareStorageService _storage;

        public PostController(IMongoDatabase database, UserRepository userRepository, CloudflareStorageService storage)
        {
            _usersCollection = database.GetCollection<User>("Users");
            _postsCollection = database.GetCollection<Post>("Posts");
            _commentsCollection = database.GetCollection<Comment>("Comments");
            _userRepository = userRepository;
            _storage = storage;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromForm] PostCreationDto postDto)
        {
            if (postDto.Images == null || postDto.Images.Length == 0)
                return BadRequest(new { message = "At least one image is required." });

            if (postDto.Images.Length > 3)
                return BadRequest(new { message = "Maximum 3 images allowed." });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound(new { message = "User not found." });

            var uploadedImageUrls = new List<string>();

            foreach (var image in postDto.Images)
            {
                if (!ImageHelper.IsValidImage(image))
                    return BadRequest(new { message = $"Invalid image format: {image.FileName}" });

                if (!ImageHelper.IsValidImageSize(image))
                    return BadRequest(new { message = $"Image too large: {image.FileName}" });

                var imageUrl = await _storage.UploadImageAsync(image);
                uploadedImageUrls.Add(imageUrl);
            }

            var post = new Post
            {
                UserId = userId,
                Description = postDto.Description,
                Price = postDto.Price,
                ImageUrls = uploadedImageUrls
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
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
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

        [HttpPost("{postId}/unlike")]
        public async Task<IActionResult> UnlikePost(string postId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound(new { message = "User not found." });

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound(new { message = "Post not found." });

            if (user.LikedPostIds.Contains(postId))
            {
                user.LikedPostIds.Remove(postId);
                await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
            }

            return Ok(new { message = "Post unliked." });
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
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var posts = await _postsCollection
                .Find(p => user.FollowingIds.Contains(p.UserId))
                .SortByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(posts);
        }

        [HttpDelete("{postId}")]
        public async Task<IActionResult> DeletePost(string postId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound(new { message = "User not found." });

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound(new { message = "Post not found." });
            
            if (!user.PostIds.Contains(postId)) return Unauthorized(new { message = "You can only delete your own posts." });

            foreach (var imageUrl in post.ImageUrls)
            {
                await _storage.DeleteImageAsync(imageUrl);
            }

            user.PostIds.Remove(postId);
            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);

            await _postsCollection.DeleteOneAsync(p => p.Id == postId);
            await _commentsCollection.DeleteManyAsync(c => post.CommentIds.Contains(c.Id));

            return Ok(new { message = "Post deleted successfully." });
        }

        [HttpPatch("{postId}")]
        public async Task<IActionResult> EditPost(string postId, [FromBody] PostUpdateDto updateDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound(new { message = "User not found." });

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound(new { message = "Post not found." });

            if (!user.PostIds.Contains(postId)) return Unauthorized(new { message = "You can only edit your own posts." });

            var update = Builders<Post>.Update
                .Set(p => p.Description, updateDto.Description)
                .Set(p => p.Price, updateDto.Price);

            await _postsCollection.UpdateOneAsync(p => p.Id == postId, update);

            return Ok(new { message = "Post updated successfully." });
        }

        [HttpDelete("{postId}/comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(string postId, string commentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var comment = await _commentsCollection.Find(c => c.Id == commentId).FirstOrDefaultAsync();
            
            if (comment == null) return NotFound(new { message = "Comment not found." });
                
            if (comment.UserId != userId) return Unauthorized(new { message = "You can only delete your own comments." });

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound(new { message = "Post not found." });

            post.CommentIds.Remove(commentId);
            await _postsCollection.ReplaceOneAsync(p => p.Id == post.Id, post);
            await _commentsCollection.DeleteOneAsync(c => c.Id == commentId);

            return Ok(new { message = "Comment deleted successfully." });
        }

        [HttpPatch("{postId}/comments/{commentId}")]
        public async Task<IActionResult> EditComment(string postId, string commentId, [FromBody] CommentUpdateDto updateDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var comment = await _commentsCollection.Find(c => c.Id == commentId).FirstOrDefaultAsync();
            
            if (comment == null) return NotFound(new { message = "Comment not found." });
                
            if (comment.UserId != userId) return Unauthorized(new { message = "You can only edit your own comments." });

            var update = Builders<Comment>.Update
                .Set(c => c.Text, updateDto.Text);

            await _commentsCollection.UpdateOneAsync(c => c.Id == commentId, update);

            return Ok(new { message = "Comment updated successfully." });
        }
    }
}
