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
    [Authorize(Roles = "3")] // Chỉ Employer mới được gọi API này
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
        return Ok(result);
    }

    
}