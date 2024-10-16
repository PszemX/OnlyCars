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

        public PostController(IMongoDatabase database)
        {
            _usersCollection = database.GetCollection<User>("Users");
        }

        // Unlock a post using tokens
        [HttpPost("{userId}/unlock/{postId}")]
        public async Task<IActionResult> UnlockPost(string userId, string postId)
        {
            var user = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return NotFound("User not found.");

            var post = user.Posts.FirstOrDefault(p => p.Id == postId);
            if (post == null) return NotFound("Post not found.");

            if (user.TokenBalance < post.Price)
                return BadRequest("Insufficient tokens.");

            user.TokenBalance -= post.Price;
            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);

            return Ok("Post unlocked.");
        }
    }
}
