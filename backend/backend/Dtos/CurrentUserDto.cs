namespace backend.Dtos
{
    public class CurrentUserDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public int TokenBalance { get; set; }
        public List<string> FollowingUserIds { get; set; } = new();
        public List<string> LikedPostIds { get; set; } = new();
        public List<string> PurchasedPostIds { get; set; } = new();
        public byte[]? ProfilePicture { get; set; }
    }
}