using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
        public List<string> FollowingIds { get; set; } = new List<string>();
        public List<string> FollowerIds { get; set; } = new List<string>();
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public int TokenBalance { get; set; } = 0;
        public string? WalletAddress { get; set; }
        public byte[]? ProfilePicture { get; set; } 
        public List<string> PostIds { get; set; } = new List<string>();
        public List<string> PurchasedPostIds { get; set; } = new List<string>();
        public List<string> LikedPostIds { get; set; } = new List<string>();
    }
}
