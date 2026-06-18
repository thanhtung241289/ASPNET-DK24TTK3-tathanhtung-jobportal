// File: JobPortal.Application/DTOs/UploadResumeDto.cs

namespace JobPortal.Application.DTOs;
using Microsoft.AspNetCore.Http;
public class UploadResumeDto
{
    // IFormFile là interface chuyên nghiệp bắt buộc phải có để nhận file từ FromData
    public IFormFile File { get; set; } = null!;
}