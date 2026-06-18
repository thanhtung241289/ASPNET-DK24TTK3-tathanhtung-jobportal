// File: JobPortal.Application/DTOs/ApproveJobRequest.cs
using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTOs;

public class ApproveJobRequest
{
    public JobStatus Status { get; set; } // Chỉ chấp nhận Published hoặc Rejected
    public string? RejectReason { get; set; } // Bắt buộc nhập nếu Status là Rejected
}