// File: JobPortal.Application/DTOs/ApplyJobRequest.cs
namespace JobPortal.Application.DTOs;

public class ApplyJobRequest
{
    public Guid JobId { get; set; }
    public Guid ResumeId { get; set; }
}