// File: JobPortal.API/Controllers/AdminCompanyController.cs
using JobPortal.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/admin/companies")]
[Authorize(Roles = "Admin")]
public class AdminCompanyController : ControllerBase
{
    private readonly JobPortalDbContext _context;

    public AdminCompanyController(JobPortalDbContext context)
    {
        _context = context;
    }

    // 1. Lấy danh sách tất cả công ty trong hệ thống
    [HttpGet]
    public async Task<IActionResult> GetAllCompanies()
    {
        var companies = await _context.Companies
            .AsNoTracking()
            .Include(c => c.User)
            .Include(c => c.JobPosts)
            .OrderByDescending(c => c.IsVerified)
            .Select(c => new
            {
                c.Id,
                c.CompanyName,
                c.LogoUrl,
                c.Address,
                c.CompanySize,
                c.Website,
                c.IsVerified,
                c.IsLocked,
                Email = c.User != null ? c.User.Email : null,
                JobCount = c.JobPosts.Count()
            })
            .ToListAsync();

        return Ok(companies);
    }

    // 2. Khóa / Mở khóa tài khoản công ty
    [HttpPut("{id}/toggle-lock")]
    public async Task<IActionResult> ToggleLock(Guid id)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == id);
        if (company == null)
            return NotFound(new { message = "Không tìm thấy thông tin công ty." });

        company.IsLocked = !company.IsLocked;
        await _context.SaveChangesAsync();

        var msg = company.IsLocked
            ? "Đã khóa tài khoản công ty thành công."
            : "Đã mở khóa tài khoản công ty thành công.";

        return Ok(new { isLocked = company.IsLocked, message = msg });
    }

    // 3. Xác thực / Hủy xác thực công ty
    [HttpPut("{id}/toggle-verify")]
    public async Task<IActionResult> ToggleVerify(Guid id)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == id);
        if (company == null)
            return NotFound(new { message = "Không tìm thấy thông tin công ty." });

        company.IsVerified = !company.IsVerified;
        await _context.SaveChangesAsync();

        var msg = company.IsVerified
            ? "Đã xác thực công ty thành công."
            : "Đã hủy xác thực công ty.";

        return Ok(new { isVerified = company.IsVerified, message = msg });
    }
}