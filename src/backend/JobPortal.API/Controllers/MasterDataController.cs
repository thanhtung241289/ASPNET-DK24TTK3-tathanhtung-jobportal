using JobPortal.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MasterDataController : ControllerBase
{
    private readonly JobPortalDbContext _context;

    public MasterDataController(JobPortalDbContext context)
    {
        _context = context;
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories() => Ok(await _context.Categories.ToListAsync());

    [HttpGet("skills")]
    public async Task<IActionResult> GetSkills() => Ok(await _context.Skills.ToListAsync());

    [HttpGet("locations")]
    public async Task<IActionResult> GetLocations() => Ok(await _context.Locations.ToListAsync());
}