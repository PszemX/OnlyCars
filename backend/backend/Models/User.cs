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
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public int TokenBalance { get; set; }
        public string WalletAddress { get; set; } = null!;
        public List<string> PostIds { get; set; } = new List<string>();
        public List<string> PurchasedPostIds { get; set; } = new List<string>();
        public List<string> LikedPostIds { get; set; } = new List<string>();
    }
}
