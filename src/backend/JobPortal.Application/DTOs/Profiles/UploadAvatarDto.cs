using Microsoft.AspNetCore.Http;

namespace JobPortal.Application.DTOs.Profiles;

public class UploadAvatarDto
{
    public IFormFile File { get; set; } = null!;
}