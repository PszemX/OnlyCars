using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class Post
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        public string ImageUrl { get; set; } = null!;

        public string Description { get; set; } = null!;

        public int Price { get; set; }

        public int Likes { get; set; } = 0;

        public List<Comment> Comments { get; set; } = new List<Comment>();
    }

    public class Comment
    {
        public string User { get; set; } = null!;
        public string Text { get; set; } = null!;
    }
}
