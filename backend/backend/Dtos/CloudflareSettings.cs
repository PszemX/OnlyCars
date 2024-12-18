namespace backend.Dtos
{
public class CloudflareSettings
{
    public string AccountId { get; set; } = null!;
    public string AccessKey { get; set; } = null!;
    public string SecretKey { get; set; } = null!;
    public string BucketName { get; set; } = null!;
}
}