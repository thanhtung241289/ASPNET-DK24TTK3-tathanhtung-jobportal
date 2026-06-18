// File: JobPortal.Application/Interfaces/IApplicationService.cs
using JobPortal.Application.DTOs;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Interfaces;

public interface IApplicationService
{
    Task<Guid?> UploadResumeAsync(Guid userId, UploadResumeDto dto);
    Task<bool> ApplyJobAsync(Guid userId, ApplyJobRequest request);
    Task<IEnumerable<object>> GetApplicationTrackerAsync(Guid userId); // Xem trạng thái các đơn đã nộp
    // Thêm vào IApplicationService.cs
    Task<bool> UpdateApplicationStatusAsync(Guid userId, Guid applicationId, ApplicationStatus status);
}