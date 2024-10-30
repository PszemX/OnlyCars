namespace backend.Dtos
{
    public class PostCreationDto
    {
        public string Description { get; set; } = null!;
        public string ImageUrl { get; set; } = null!;
        public int Price { get; set; }
    }
}
