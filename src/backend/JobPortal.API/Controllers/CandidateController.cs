// File: JobPortal.API/Controllers/CandidateController.cs
using System.Security.Claims;
using JobPortal.Application.DTOs;
using JobPortal.Application.DTOs.Profiles; // Cần có using này để nhận UpdateCandidateProfileDto
using JobPortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Seeker")] // Chỉ duy nhất Ứng viên (Role Seeker) mới được truy cập
public class CandidateController : ControllerBase
{
    private readonly IApplicationService _appService;
    private readonly IProfileService _profileService; // [ĐÃ SỬA LỖI 1]: Khai báo service

    // [ĐÃ SỬA LỖI 1]: Tiêm (Inject) IProfileService vào Constructor
    public CandidateController(IApplicationService appService, IProfileService profileService)
    {
        _appService = appService;
        _profileService = profileService;
    }

    // ==========================================
    // 1. QUẢN LÝ THÔNG TIN CÁ NHÂN (PROFILE)
    // ==========================================
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        // Chú ý: Backend đang map Role Seeker là "2"
        var profile = await _profileService.GetProfileAsync(userId, "2"); 
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateCandidateProfileDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _profileService.UpdateCandidateProfileAsync(userId, dto);
        return Ok(new { message = "Cập nhật hồ sơ thành công!" });
    }

    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar([FromForm] UploadAvatarDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try {
            var avatarUrl = await _profileService.UploadAvatarAsync(userId, dto);
            if (avatarUrl == null) return BadRequest(new { message = "Vui lòng cập nhật thông tin cá nhân trước khi tải ảnh đại diện." });
            return Ok(new { message = "Cập nhật ảnh đại diện thành công!", avatarUrl });
        } catch (Exception ex) {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ==========================================
    // 2. QUẢN LÝ KHO CV
    // ==========================================
    [HttpPost("resume")]
    public async Task<IActionResult> UploadResume([FromForm] UploadResumeDto dto) 
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try {
            var resumeId = await _appService.UploadResumeAsync(userId, dto);
            if (resumeId == null) return BadRequest(new { message = "Vui lòng cập nhật thông tin cá nhân trước khi tải CV." });
            return Ok(new { message = "Lưu file CV thành công!", resumeId });
        } catch (Exception ex) {
            return BadRequest(new { message = ex.Message });
        }
    }

    // [BỔ SUNG]: Lấy danh sách CV đã tải lên
    [HttpGet("resume")]
    public async Task<IActionResult> GetMyResumes()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        // Lưu ý: Bạn cần đảm bảo đã viết hàm GetResumesByUserIdAsync trong IApplicationService
        var resumes = await _appService.GetResumesByUserIdAsync(userId);
        return Ok(resumes);
    }

    // [BỔ SUNG]: Đặt CV làm mặc định
    [HttpPut("resume/{id}/set-default")]
    public async Task<IActionResult> SetDefaultResume(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _appService.SetDefaultResumeAsync(userId, id);
        return Ok(new { message = "Cập nhật CV mặc định thành công." });
    }

    // [BỔ SUNG]: Xóa CV
    [HttpDelete("resume/{id}")]
    public async Task<IActionResult> DeleteResume(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _appService.DeleteResumeAsync(userId, id);
        return Ok(new { message = "Xóa CV thành công." });
    }

    // ==========================================
    // 3. ỨNG TUYỂN VÀ THEO DÕI (APPLICATIONS)
    // ==========================================
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