namespace backend.Dtos
{
    public class UserUpdateDto
    {
        public string Password { get; set; } = null!;
        public string? UserName { get; set; }
        public string? NewPassword { get; set; }
        public string? Description { get; set; }
        public string? WalletAddress { get; set; }
        public IFormFile? ProfilePictureUrl { get; set; }
    }
}