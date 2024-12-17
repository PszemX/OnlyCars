using Amazon.S3;
using Amazon.S3.Model;
using Amazon.Runtime;

public class CloudflareStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _accountId;
    private readonly string _subdomain;

    public CloudflareStorageService()
    {   
        DotNetEnv.Env.Load();
        _bucketName = Environment.GetEnvironmentVariable("CLOUDFLARE_BUCKET_NAME")!;
        _accountId = Environment.GetEnvironmentVariable("CLOUDFLARE_ACCOUNT_ID")!;
        _subdomain = Environment.GetEnvironmentVariable("CLOUDFLARE_SUBDOMAIN_ID")!;
        var accessKey = Environment.GetEnvironmentVariable("CLOUDFLARE_ACCESS_KEY")!;
        var secretKey = Environment.GetEnvironmentVariable("CLOUDFLARE_SECRET_KEY")!;

        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{_accountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true
        };

        var credentials = new BasicAWSCredentials(accessKey, secretKey);
        _s3Client = new AmazonS3Client(credentials, config);
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{fileExtension}";

        //using var stream = file.OpenReadStream();

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName,
            InputStream = memoryStream,
            ContentType = file.ContentType,
            AutoCloseStream = true,
            DisablePayloadSigning = true
        };

        await _s3Client.PutObjectAsync(request);

        return $"https://pub-{_subdomain}.r2.dev/{fileName}";
    }

    public async Task DeleteImageAsync(string imageUrl)
    {
        var fileName = Path.GetFileName(new Uri(imageUrl).AbsolutePath);
        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName
        };

        await _s3Client.DeleteObjectAsync(request);
    }
}