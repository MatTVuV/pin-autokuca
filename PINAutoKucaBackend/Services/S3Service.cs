using Amazon.S3;
using Amazon.S3.Model;

public class S3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3Service(IAmazonS3 s3Client, IConfiguration configuration)
    {
        _s3Client = s3Client;
        _bucketName = configuration["AWS:BucketName"] ?? throw new ArgumentNullException("BucketName nije konfiguriran.");
    }

    public async Task<string> UploadFileAsync(IFormFile file, string registracija)
    {
        var objectKey = $"vozila/{registracija}/{Guid.NewGuid()}_{file.FileName}";

        using var newStream = new MemoryStream();
        await file.CopyToAsync(newStream);

        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = objectKey,
            InputStream = newStream,
            ContentType = file.ContentType
        };

        await _s3Client.PutObjectAsync(request);
        return objectKey;
    }

    public string GetPresignedUrl(string objectKey)
    {
        if (string.IsNullOrEmpty(objectKey)) return string.Empty;

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = objectKey,
            Expires = DateTime.UtcNow.AddHours(2)
        };

        return _s3Client.GetPreSignedURL(request);
    }
}
