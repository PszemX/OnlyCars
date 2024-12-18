namespace backend.Dtos
{
    public class PostCreationDto
    {
        public string Description { get; set; } = string.Empty;
        public IFormFile[] Images { get; set; } = Array.Empty<IFormFile>();
        public int Price { get; set; }
    }
}
