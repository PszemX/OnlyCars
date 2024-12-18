using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class Comment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
        public string UserId { get; set; } = string.Empty;
        public string? Text { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}