// File: JobPortal.Application/DTOs/UpdateApplicationStatusDto.cs
using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTOs;

public class UpdateApplicationStatusDto
{
    public ApplicationStatus Status { get; set; } // Ví dụ: Viewed, Interviewing, Accepted, Rejected
}