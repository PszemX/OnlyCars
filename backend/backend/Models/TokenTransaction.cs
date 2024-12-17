using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class TokenTransaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int Amount { get; set; }
        public DateTime Date { get; set; }
    }
}
