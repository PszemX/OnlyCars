using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class TokenTransaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
        public string UserId { get; set; } = string.Empty;
        public int Amount { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string TransactionHash { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}
