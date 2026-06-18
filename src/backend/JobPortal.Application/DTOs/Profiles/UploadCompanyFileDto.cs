// File: JobPortal.Application/DTOs/Profiles/UploadCompanyFileDto.cs
using Microsoft.AspNetCore.Http;

namespace JobPortal.Application.DTOs.Profiles;

public class UploadCompanyFileDto
{
    public IFormFile File { get; set; } = null!;
}
