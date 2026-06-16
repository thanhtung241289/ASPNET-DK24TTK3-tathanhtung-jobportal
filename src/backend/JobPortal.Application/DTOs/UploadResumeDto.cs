// File: JobPortal.Application/DTOs/UploadResumeDto.cs
namespace JobPortal.Application.DTOs;

public class UploadResumeDto
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public bool IsDefault { get; set; } = false;
}