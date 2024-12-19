namespace backend.Dtos
{
    public class UserWalletInfoDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? WalletAddress { get; set; }
        public decimal? WalletBalance { get; set; }
    }
}