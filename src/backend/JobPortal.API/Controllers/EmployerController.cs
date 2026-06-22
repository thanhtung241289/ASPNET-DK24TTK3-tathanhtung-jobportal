// File: JobPortal.API/Controllers/EmployerController.cs
using System.Security.Claims;
using JobPortal.Application.DTOs;
using JobPortal.Application.DTOs.Profiles;
using JobPortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Employer")] // Rào chắn chỉ cho phép tài khoản doanh nghiệp truy cập
public class EmployerController : ControllerBase
{
    private readonly IApplicationService _appService;
    private readonly IProfileService _profileService;
    private readonly IJobService _jobService;

    public EmployerController(IApplicationService appService, IProfileService profileService, IJobService jobService)
    {
        _appService = appService;
        _profileService = profileService;
        _jobService = jobService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        // Role Employer là "3"
        var profile = await _profileService.GetProfileAsync(userId, "3");
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateEmployerProfileDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _profileService.UpdateEmployerProfileAsync(userId, dto);
        return Ok(new { message = "Cập nhật thông tin công ty thành công!" });
    }

    [HttpPost("logo")]
    public async Task<IActionResult> UploadLogo([FromForm] UploadCompanyFileDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var logoUrl = await _profileService.UploadCompanyLogoAsync(userId, dto);
            if (logoUrl == null) return BadRequest(new { message = "Không tìm thấy hồ sơ công ty." });
            return Ok(new { message = "Cập nhật Logo công ty thành công!", logoUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("cover")]
    public async Task<IActionResult> UploadCover([FromForm] UploadCompanyFileDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var coverUrl = await _profileService.UploadCompanyCoverAsync(userId, dto);
            if (coverUrl == null) return BadRequest(new { message = "Không tìm thấy hồ sơ công ty." });
            return Ok(new { message = "Cập nhật ảnh bìa công ty thành công!", coverUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("jobs")]
    public async Task<IActionResult> GetJobs()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var jobs = await _jobService.GetEmployerJobsAsync(userId);
        return Ok(jobs);
    }

    [HttpGet("applications")]
    public async Task<IActionResult> GetApplications()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var applications = await _appService.GetApplicationsForEmployerAsync(userId);
        return Ok(applications);
    }

    [HttpPut("applications/{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateApplicationStatusDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var success = await _appService.UpdateApplicationStatusAsync(userId, id, dto.Status);
        if (!success)
            return BadRequest(new { message = "Cập nhật trạng thái thất bại. Đơn ứng tuyển không tồn tại hoặc không thuộc quyền quản lý của công ty bạn." });

        return Ok(new { message = "Cập nhật trạng thái xử lý hồ sơ thành công!" });
    }

    [HttpPost("skills")]
    public async Task<IActionResult> CreateSkill([FromBody] CreateSkillDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Tên kỹ năng không được để trống." });
        }
        var skill = await _jobService.CreateSkillAsync(dto.Name);
        return Ok(new { id = skill.Id, name = skill.Name });
    }
}

public class CreateSkillDto
{
    public string Name { get; set; } = string.Empty;
}