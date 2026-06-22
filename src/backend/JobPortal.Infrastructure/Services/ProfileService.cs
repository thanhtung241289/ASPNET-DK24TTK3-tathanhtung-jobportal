// File: JobPortal.Infrastructure/Services/ProfileService.cs
using JobPortal.Application.DTOs.Profiles;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly JobPortalDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ProfileService(JobPortalDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<object?> GetProfileAsync(Guid userId, string role)
    {
        if (role == "Candidate" || role == "Seeker" || role == "2")
        {
            var profile = await _context.SeekerProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
            
            if (profile == null) return null;

            // Trả về object có thêm email từ User
            return new
            {
                profile.Id,
                profile.UserId,
                profile.FullName,
                profile.Phone,
                profile.Title,
                profile.Experience,
                profile.Education,
                profile.SkillsSummary,
                profile.AvatarUrl,
                Email = profile.User?.Email
            };
        }
        if (role == "Employer" || role == "3")
        {
            var company = await _context.Companies.FirstOrDefaultAsync(p => p.UserId == userId);
            if (company == null)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                company = new Company
                {
                    UserId = userId,
                    CompanyName = user?.Email.Split('@')[0] ?? "Doanh nghiệp mới",
                    IsVerified = false
                };
                _context.Companies.Add(company);
                await _context.SaveChangesAsync();
            }
            return company;
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
        company.CoverUrl = dto.CoverUrl;
        company.ShortDescription = dto.ShortDescription;
        company.CompanySize = dto.CompanySize;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string?> UploadAvatarAsync(Guid userId, UploadAvatarDto dto)
    {
        // 1. Kiểm tra ứng viên đã có Profile chưa, nếu chưa tự động khởi tạo hồ sơ trống
        var profile = await _context.SeekerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            profile = new SeekerProfile 
            { 
                UserId = userId,
                FullName = user?.Email.Split('@')[0] ?? "Ứng viên mới"
            };
            _context.SeekerProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }

        // 2. Validate File (Chỉ nhận ảnh .jpg, .jpeg, .png và < 2MB)
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(dto.File.FileName).ToLower();
        
        if (!allowedExtensions.Contains(extension) || dto.File.Length > 2 * 1024 * 1024)
            throw new Exception("Định dạng file không hợp lệ hoặc vượt quá 2MB (chỉ chấp nhận .jpg, .jpeg, .png).");

        // 3. Tạo thư mục lưu trữ nếu chưa có
        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "avatars");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        // 4. Đổi tên file chống trùng lặp (Sử dụng Guid)
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // 5. Copy luồng byte vật lý vào máy chủ
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await dto.File.CopyToAsync(fileStream);
        }

        // 6. Cập nhật AvatarUrl trong Database
        var relativeUrl = $"/avatars/{uniqueFileName}";
        profile.AvatarUrl = relativeUrl;
        await _context.SaveChangesAsync();

        return relativeUrl;
    }

    public async Task<string?> UploadCompanyLogoAsync(Guid userId, UploadCompanyFileDto dto)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
        if (company == null) return null;

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(dto.File.FileName).ToLower();
        
        if (!allowedExtensions.Contains(extension) || dto.File.Length > 2 * 1024 * 1024)
            throw new Exception("Định dạng file không hợp lệ hoặc vượt quá 2MB (chỉ chấp nhận .jpg, .jpeg, .png).");

        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "logos");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await dto.File.CopyToAsync(fileStream);
        }

        var relativeUrl = $"/logos/{uniqueFileName}";
        company.LogoUrl = relativeUrl;
        await _context.SaveChangesAsync();

        return relativeUrl;
    }

    public async Task<string?> UploadCompanyCoverAsync(Guid userId, UploadCompanyFileDto dto)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
        if (company == null) return null;

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(dto.File.FileName).ToLower();
        
        if (!allowedExtensions.Contains(extension) || dto.File.Length > 2 * 1024 * 1024)
            throw new Exception("Định dạng file không hợp lệ hoặc vượt quá 2MB (chỉ chấp nhận .jpg, .jpeg, .png).");

        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "covers");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await dto.File.CopyToAsync(fileStream);
        }

        var relativeUrl = $"/covers/{uniqueFileName}";
        company.CoverUrl = relativeUrl;
        await _context.SaveChangesAsync();

        return relativeUrl;
    }
}