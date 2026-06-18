// File: JobPortal.Infrastructure/Services/ProfileService.cs
using JobPortal.Application.DTOs.Profiles;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly JobPortalDbContext _context;

    public ProfileService(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<object?> GetProfileAsync(Guid userId, string role)
    {
        if (role == "Candidate")
        {
            return await _context.SeekerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        }
        if (role == "Employer")
        {
            return await _context.Companies.FirstOrDefaultAsync(p => p.UserId == userId);
        }
        return null;
    }

    public async Task<bool> UpdateCandidateProfileAsync(Guid userId, UpdateCandidateProfileDto dto)
    {
        var profile = await _context.SeekerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        
        if (profile == null)
        {
            profile = new SeekerProfile { UserId = userId };
            _context.SeekerProfiles.Add(profile);
        }

        profile.FullName = dto.FullName;
        profile.Phone = dto.Phone;
        profile.Title = dto.Title;
        profile.Experience = dto.Experience;
        profile.Education = dto.Education;
        profile.SkillsSummary = dto.SkillsSummary;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateEmployerProfileAsync(Guid userId, UpdateEmployerProfileDto dto)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);

        if (company == null)
        {
            company = new Company { UserId = userId };
            _context.Companies.Add(company);
        }

        company.CompanyName = dto.CompanyName;
        company.Website = dto.Website;
        company.Description = dto.Description;
        company.Address = dto.Address;
        company.LogoUrl = dto.LogoUrl;

        await _context.SaveChangesAsync();
        return true;
    }
}