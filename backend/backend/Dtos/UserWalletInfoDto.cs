namespace backend.Dtos
{
    public class UserWalletInfoDto
    {
        public string UserName { get; set; } = null!;
        public string? WalletAddress { get; set; }
        public decimal? WalletBalance { get; set; }
    }
}