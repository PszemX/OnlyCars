namespace backend.Helpers
{
    public static class ImageHelper
    {
        public static bool IsValidImage(IFormFile file)
        {
            if (file.Length == 0) return false;
            
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
            return allowedTypes.Contains(file.ContentType.ToLower());
        }

        public static bool IsValidImageSize(IFormFile file, long maxSizeInBytes = 5242880)
        {
            return file.Length <= maxSizeInBytes;
        }
    }
}