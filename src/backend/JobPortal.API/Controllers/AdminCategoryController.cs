// File: JobPortal.API/Controllers/AdminCategoryController.cs
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")] // Chỉ duy nhất Admin mới được truy cập các endpoint này
public class AdminCategoryController : ControllerBase
{
    private readonly JobPortalDbContext _context;

    public AdminCategoryController(JobPortalDbContext context)
    {
        _context = context;
    }

    // 1. Thêm mới Ngành nghề
    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Tên ngành nghề không được để trống." });
        }

        var trimmedName = dto.Name.Trim();
        var exists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == trimmedName.ToLower());
        if (exists)
        {
            return BadRequest(new { message = "Ngành nghề này đã tồn tại trong hệ thống." });
        }

        var category = new Category { Name = trimmedName };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(category);
    }

    // 2. Cập nhật Ngành nghề
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Tên ngành nghề không được để trống." });
        }

        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound(new { message = "Không tìm thấy ngành nghề cần cập nhật." });
        }

        var trimmedName = dto.Name.Trim();
        var exists = await _context.Categories.AnyAsync(c => c.Id != id && c.Name.ToLower() == trimmedName.ToLower());
        if (exists)
        {
            return BadRequest(new { message = "Tên ngành nghề này đã bị trùng lặp với một ngành nghề khác." });
        }

        category.Name = trimmedName;
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();

        return Ok(category);
    }

    // 3. Xóa Ngành nghề
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories
            .Include(c => c.JobPosts)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound(new { message = "Không tìm thấy ngành nghề cần xóa." });
        }

        // Chặn xóa nếu có tin tuyển dụng nào thuộc ngành nghề này để tránh lỗi khóa ngoại hoặc mồ côi
        if (category.JobPosts.Any())
        {
            return BadRequest(new { message = "Không thể xóa ngành nghề này vì hiện tại đang có tin tuyển dụng đang thuộc ngành nghề này." });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Xóa ngành nghề thành công." });
    }
}

public class CategoryDto
{
    public string Name { get; set; } = string.Empty;
}