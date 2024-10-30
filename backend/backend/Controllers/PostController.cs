using backend.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : ControllerBase
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Post> _postsCollection;

        public PostController(IMongoDatabase database)
        {
            _usersCollection = database.GetCollection<User>("Users");
            _postsCollection = database.GetCollection<Post>("Posts");
        }

        [HttpPost("{userId}/unlock/{postId}")]
        public async Task<IActionResult> UnlockPost(string userId, string postId)
        {
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound("User not found.");

            var post = await _postsCollection.Find(p => p.Id == postId).FirstOrDefaultAsync();
            if (post == null) return NotFound("Post not found.");

            if (user.TokenBalance < post.Price)
                return BadRequest("Insufficient tokens.");

            user.TokenBalance -= post.Price;

            // Add post ID to user's purchased posts if not already present
            if (!user.PurchasedPostIds.Contains(postId))
            {
                user.PurchasedPostIds.Add(postId);
            }

            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
        
            return Ok("Post unlocked.");
        }
    }
}
