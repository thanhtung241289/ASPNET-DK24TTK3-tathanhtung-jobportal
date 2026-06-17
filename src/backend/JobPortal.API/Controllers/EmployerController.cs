// File: JobPortal.API/Controllers/EmployerController.cs
using System.Security.Claims;
using JobPortal.Application.DTOs;
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

    public EmployerController(IApplicationService appService)
    {
        _appService = appService;
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
}