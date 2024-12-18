namespace backend.Dtos
{
    public class UserInfoDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public List<string> FollowingIds { get; set; } = new List<string>();
        public List<string> FollowerIds { get; set; } = new List<string>();
        public List<string> PostIds { get; set; } = new List<string>();
    }
}