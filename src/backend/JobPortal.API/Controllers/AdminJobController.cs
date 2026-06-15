// File: JobPortal.API/Controllers/AdminJobController.cs
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/admin/jobs")]
[Authorize(Roles = "1")] // Chỉ duy nhất Admin (Role 1) mới được phép vào hệ thống này
public class AdminJobController : ControllerBase
{
    private readonly IJobService _jobService;

    public AdminJobController(IJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingJobs()
    {
        var jobs = await _jobService.GetPendingJobsAsync();
        return Ok(jobs);
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveJob(Guid id, [FromBody] ApproveJobRequest request)
    {
        if (request.Status != Domain.Enums.JobStatus.Published && request.Status != Domain.Enums.JobStatus.Rejected)
        {
            return BadRequest(new { message = "Trạng thái phê duyệt không hợp lệ. Chỉ chấp nhận Published (Duyệt) hoặc Rejected (Từ chối)." });
        }

        if (request.Status == Domain.Enums.JobStatus.Rejected && string.IsNullOrWhiteSpace(request.RejectReason))
        {
            return BadRequest(new { message = "Vui lòng cung cấp lý do từ chối bài đăng." });
        }

        var success = await _jobService.ApproveJobPostAsync(id, request);
        if (!success)
        {
            return NotFound(new { message = "Không tìm thấy tin tuyển dụng chờ duyệt hoặc trạng thái tin không hợp lệ." });
        }

        var statusMessage = request.Status == Domain.Enums.JobStatus.Published ? "Phê duyệt công khai thành công!" : "Đã từ chối bài đăng tuyển dụng.";
        return Ok(new { message = statusMessage });
    }
}