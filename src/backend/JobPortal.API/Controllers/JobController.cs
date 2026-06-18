// File: JobPortal.API/Controllers/JobController.cs
using System.Security.Claims;
using JobPortal.Application.DTOs;
using JobPortal.Application.DTOs.Search;
using JobPortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobController : ControllerBase
{
    private readonly IJobService _jobService;

    public JobController(IJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpPost]
    [Authorize(Roles = "Employer")] // Chỉ Employer mới được gọi API này
    public async Task<IActionResult> CreateJob([FromBody] CreateJobPostRequest request)
    {
        // Trích xuất UserId từ Token (claim NameIdentifier được lưu lúc Login)
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out Guid userId))
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

        var jobId = await _jobService.CreateJobPostAsync(userId, request);
        
        if (jobId == null)
            return BadRequest(new { message = "Không tìm thấy hồ sơ Công ty. Vui lòng cập nhật hồ sơ trước khi đăng tin." });

        return Ok(new { 
            message = "Đăng tin tuyển dụng thành công, đang chờ Admin phê duyệt.", 
            jobId = jobId 
        });
    }

    [HttpGet("search")]
    [AllowAnonymous] // Cho phép tất cả mọi người (khách) gọi API này công khai
    public async Task<IActionResult> SearchJobs([FromQuery] JobSearchFilter filter)
    {
        var result = await _jobService.SearchJobsAsync(filter);
        
        var projectedItems = result.Items.Select(j => new {
            j.Id,
            j.Title,
            j.Quantity,
            j.SalaryMin,
            j.SalaryMax,
            j.IsNegotiable,
            j.Description,
            j.Requirements,
            j.Benefits,
            j.CreatedAt,
            j.ExpirationDate,
            Status = j.Status.ToString(),
            JobLevel = j.JobLevel.ToString(),
            WorkType = j.WorkType.ToString(),
            Category = j.Category != null ? new { j.Category.Id, j.Category.Name } : null,
            Company = j.Company != null ? new { j.Company.Id, j.Company.CompanyName, j.Company.LogoUrl, j.Company.Website, j.Company.Address } : null,
            Skills = j.Skills != null ? j.Skills.Select(s => new { s.Id, s.Name }) : Enumerable.Empty<object>(),
            Locations = j.Locations != null ? j.Locations.Select(l => new { l.Id, l.Name }) : Enumerable.Empty<object>()
        }).ToList();

        var response = new {
            Items = projectedItems,
            result.TotalItems,
            result.PageNumber,
            result.PageSize,
            result.TotalPages
        };

        return Ok(response);
    }

    // Thêm vào JobController.cs
    [HttpGet("{id}")]
    [AllowAnonymous] // Ai cũng có thể xem chi tiết bài đăng tuyển dụng
    public async Task<IActionResult> GetJobDetail(Guid id)
    {
        var jobDetail = await _jobService.GetJobPostDetailAsync(id);
        if (jobDetail == null) 
            return NotFound(new { message = "Không tìm thấy tin tuyển dụng hoặc tin đã bị gỡ." });

        return Ok(jobDetail);
    }
}