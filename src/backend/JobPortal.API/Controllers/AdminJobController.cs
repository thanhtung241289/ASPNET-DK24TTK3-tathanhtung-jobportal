// File: JobPortal.API/Controllers/AdminJobController.cs
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces;
using JobPortal.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/admin/jobs")]
[Authorize(Roles = "Admin")] // Chỉ duy nhất Admin (Role 1) mới được phép vào hệ thống này
public class AdminJobController : ControllerBase
{
    private readonly IJobService _jobService;
    private readonly JobPortalDbContext _context;

    public AdminJobController(IJobService jobService, JobPortalDbContext context)
    {
        _jobService = jobService;
        _context = context;
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingJobs()
    {
        var jobs = await _jobService.GetPendingJobsAsync();
        return Ok(jobs);
    }

    // 1. Lấy tất cả tin tuyển dụng trong hệ thống để phục vụ quản lý & cấu hình hot
    [HttpGet]
    public async Task<IActionResult> GetAllJobs()
    {
        var jobs = await _context.JobPosts
            .Include(j => j.Company)
            .Include(j => j.Category)
            .OrderByDescending(j => j.CreatedAt)
            .Select(j => new {
                j.Id,
                j.Title,
                CompanyName = j.Company.CompanyName,
                CategoryName = j.Category.Name,
                Status = j.Status.ToString(),
                j.IsHot,
                j.CreatedAt,
                j.ExpirationDate
            })
            .ToListAsync();
        return Ok(jobs);
    }

    // 2. Phê duyệt hoặc từ chối tin tuyển dụng
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

    // 3. Bật/tắt trạng thái Tin tuyển dụng nổi bật (IsHot)
    [HttpPut("{id}/toggle-hot")]
    public async Task<IActionResult> ToggleHot(Guid id)
    {
        var job = await _context.JobPosts.FirstOrDefaultAsync(j => j.Id == id);
        if (job == null)
        {
            return NotFound(new { message = "Không tìm thấy tin tuyển dụng." });
        }

        // Đảo cờ IsHot
        job.IsHot = !job.IsHot;
        _context.JobPosts.Update(job);
        await _context.SaveChangesAsync();

        var message = job.IsHot ? "Đã đặt làm tin tuyển dụng nổi bật!" : "Đã hủy trạng thái nổi bật.";
        return Ok(new { isHot = job.IsHot, message });
    }

    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var totalJobs = await _context.JobPosts.CountAsync();
        var pendingJobs = await _context.JobPosts.CountAsync(j => j.Status == Domain.Enums.JobStatus.Pending);
        var publishedJobs = await _context.JobPosts.CountAsync(j => j.Status == Domain.Enums.JobStatus.Published);
        var rejectedJobs = await _context.JobPosts.CountAsync(j => j.Status == Domain.Enums.JobStatus.Rejected);

        var totalCompanies = await _context.Companies.CountAsync();
        var verifiedCompanies = await _context.Companies.CountAsync(c => c.IsVerified);
        var lockedCompanies = await _context.Companies.CountAsync(c => c.IsLocked);

        var totalCandidates = await _context.SeekerProfiles.CountAsync();
        var totalResumes = await _context.Resumes.CountAsync();

        var totalApplications = await _context.Applications.CountAsync();
        var newApplications = await _context.Applications.CountAsync(a => a.Status == Domain.Enums.ApplicationStatus.New);
        var interviewingApplications = await _context.Applications.CountAsync(a => a.Status == Domain.Enums.ApplicationStatus.Interviewing);
        var rejectedApplications = await _context.Applications.CountAsync(a => a.Status == Domain.Enums.ApplicationStatus.Rejected);
        var acceptedApplications = await _context.Applications.CountAsync(a => a.Status == Domain.Enums.ApplicationStatus.Offered);

        var categoryStats = await _context.JobPosts
            .Include(j => j.Category)
            .GroupBy(j => j.Category.Name)
            .Select(g => new
            {
                CategoryName = g.Key ?? "Chưa phân loại",
                Count = g.Count()
            })
            .ToListAsync();

        var recentJobs = await _context.JobPosts
            .Include(j => j.Company)
            .OrderByDescending(j => j.CreatedAt)
            .Take(5)
            .Select(j => new
            {
                j.Id,
                j.Title,
                CompanyName = j.Company.CompanyName,
                Status = j.Status.ToString(),
                j.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Jobs = new { Total = totalJobs, Pending = pendingJobs, Published = publishedJobs, Rejected = rejectedJobs },
            Companies = new { Total = totalCompanies, Verified = verifiedCompanies, Locked = lockedCompanies },
            Candidates = new { Total = totalCandidates, Resumes = totalResumes },
            Applications = new { Total = totalApplications, New = newApplications, Interviewing = interviewingApplications, Rejected = rejectedApplications, Accepted = acceptedApplications },
            CategoryStats = categoryStats,
            RecentJobs = recentJobs
        });
    }
}