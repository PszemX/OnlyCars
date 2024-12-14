namespace backend.Dtos
{
    public class PostCreationDto
    {
        public string Description { get; set; } = null!;
        public List<string> ImagesData { get; set; } = new List<string>();
        public int Price { get; set; }
    }
}
