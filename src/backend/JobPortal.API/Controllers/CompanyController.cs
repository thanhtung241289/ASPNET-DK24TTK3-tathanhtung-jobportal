// File: JobPortal.API/Controllers/CompanyController.cs
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;
using JobPortal.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompanyController : ControllerBase
{
    private readonly JobPortalDbContext _context;

    public CompanyController(JobPortalDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCompanyDetail(Guid id)
    {
        var company = await _context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (company == null)
            return NotFound(new { message = "Không tìm thấy thông tin công ty." });

        var publishedJobs = await _context.JobPosts
            .Include(j => j.Category)
            .Include(j => j.Skills)
            .Include(j => j.Locations)
            .Where(j => j.CompanyId == id && j.Status == JobStatus.Published)
            .OrderByDescending(j => j.CreatedAt)
            .Select(j => new
            {
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
                Company = new { company.Id, company.CompanyName, company.LogoUrl, company.Website, company.Address }, // Cần gán Company khớp với DTO của JobCard.jsx ở client
                Skills = j.Skills.Select(s => new { s.Id, s.Name }),
                Locations = j.Locations.Select(l => new { l.Id, l.Name })
            })
            .ToListAsync();

        return Ok(new
        {
            company.Id,
            company.CompanyName,
            company.LogoUrl,
            company.CoverUrl,
            company.Website,
            company.Address,
            company.CompanySize,
            company.ShortDescription,
            company.Description,
            company.IsVerified,
            JobPosts = publishedJobs
        });
    }
}