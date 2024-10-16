using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class Post
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("ImageUrl")]
        public string ImageUrl { get; set; } = null!;

        [BsonElement("Description")]
        public string Description { get; set; } = null!;

        [BsonElement("Price")]
        public int Price { get; set; }

        [BsonElement("Likes")]
        public int Likes { get; set; } = 0;

        [BsonElement("Comments")]
        public List<Comment> Comments { get; set; } = new List<Comment>();
    }

    public class Comment
    {
        public string User { get; set; } = null!;
        public string Text { get; set; } = null!;
    }
}
