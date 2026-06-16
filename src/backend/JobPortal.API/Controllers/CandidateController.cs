// File: JobPortal.API/Controllers/CandidateController.cs
using System.Security.Claims;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "2")] // Chỉ duy nhất Ứng viên (Role 2) mới được gọi cụm API này
public class CandidateController : ControllerBase
{
    private readonly IApplicationService _appService;

    public CandidateController(IApplicationService appService)
    {
        _appService = appService;
    }

    [HttpPost("resume")]
    public async Task<IActionResult> UploadResume([FromBody] UploadResumeDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resumeId = await _appService.UploadResumeAsync(userId, dto);
        
        if (resumeId == null) 
            return BadRequest(new { message = "Không thể lưu hồ sơ. Vui lòng cập nhật thông tin cá nhân trước." });

        return Ok(new { message = "Lưu file CV thành công!", resumeId });
    }

    [HttpPost("apply")]
    public async Task<IActionResult> ApplyJob([FromBody] ApplyJobRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var success = await _appService.ApplyJobAsync(userId, request);

        if (!success)
            return BadRequest(new { message = "Ứng tuyển thất bại. Lý do: Tin hết hạn, CV không hợp lệ hoặc bạn đã nộp đơn trước đó." });

        return Ok(new { message = "Nộp đơn ứng tuyển thành công! Nhà tuyển dụng sẽ xem hồ sơ của bạn." });
    }

    [HttpGet("applications")]
    public async Task<IActionResult> GetMyApplications()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var list = await _appService.GetApplicationTrackerAsync(userId);
        return Ok(list);
    }
}