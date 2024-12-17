namespace backend.Dtos
{
    public class UserInfoDto
    {
        public string Id { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public byte[]? ProfilePicture { get; set; }
        public List<string> FollowingIds { get; set; } = new List<string>();
        public List<string> FollowerIds { get; set; } = new List<string>();
        public List<string> PostIds { get; set; } = new List<string>();
    }
}