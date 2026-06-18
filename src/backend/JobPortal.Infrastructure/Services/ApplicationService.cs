// File: JobPortal.Infrastructure/Services/ApplicationService.cs
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;
using JobPortal.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Services;

public class ApplicationService : IApplicationService
{
    private readonly JobPortalDbContext _context;

    public ApplicationService(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<Guid?> UploadResumeAsync(Guid userId, UploadResumeDto dto)
    {
        var seeker = await _context.SeekerProfiles.FirstOrDefaultAsync(s => s.UserId == userId);
        if (seeker == null) return null;

        // Nếu đặt CV này làm mặc định, bỏ mặc định các CV cũ
        if (dto.IsDefault)
        {
            var oldResumes = await _context.Resumes.Where(r => r.SeekerId == seeker.Id).ToListAsync();
            oldResumes.ForEach(r => r.IsDefault = false);
        }

        var resume = new Resume
        {
            SeekerId = seeker.Id,
            FileName = dto.FileName,
            FileUrl = dto.FileUrl,
            IsDefault = dto.IsDefault
        };

        _context.Resumes.Add(resume);
        await _context.SaveChangesAsync();
        return resume.Id;
    }

    public async Task<bool> ApplyJobAsync(Guid userId, ApplyJobRequest request)
    {
        // 1. Lấy thông tin SeekerProfile
        var seeker = await _context.SeekerProfiles.FirstOrDefaultAsync(s => s.UserId == userId);
        if (seeker == null) return false;

        // 2. Kiểm tra xem Tin tuyển dụng có hợp lệ và còn hạn không
        var job = await _context.JobPosts.FirstOrDefaultAsync(j => j.Id == request.JobId && j.Status == JobStatus.Published);
        if (job == null || job.ExpirationDate < DateTime.UtcNow) return false;

        // 3. Kiểm tra CV có thuộc quyền sở hữu của Seeker này không
        var resumeExists = await _context.Resumes.AnyAsync(r => r.Id == request.ResumeId && r.SeekerId == seeker.Id);
        if (!resumeExists) return false;

        // 4. Kiểm tra xem ứng viên đã nộp đơn vào bài này chưa (Tránh spam)
        var alreadyApplied = await _context.Applications.AnyAsync(a => a.JobId == request.JobId && a.SeekerId == seeker.Id);
        if (alreadyApplied) return false;

        // 5. Lưu đơn ứng tuyển
        var application = new Domain.Entities.Application
        {
            JobId = request.JobId,
            SeekerId = seeker.Id,
            ResumeId = request.ResumeId,
            Status = ApplicationStatus.New
        };

        _context.Applications.Add(application);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<object>> GetApplicationTrackerAsync(Guid userId)
    {
        var seeker = await _context.SeekerProfiles.FirstOrDefaultAsync(s => s.UserId == userId);
        if (seeker == null) return Enumerable.Empty<object>();

        return await _context.Applications
            .Include(a => a.JobPost)
                .ThenInclude(j => j.Company)
            .Where(a => a.SeekerId == seeker.Id)
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new
            {
                a.Id,
                JobTitle = a.JobPost.Title,
                CompanyName = a.JobPost.Company.CompanyName,
                LogoUrl = a.JobPost.Company.LogoUrl,
                a.AppliedAt,
                Status = a.Status.ToString() // Trả về text trạng thái (New, Viewed, Interviewing...)
            })
            .ToListAsync();
    }
    
    // Thêm vào ApplicationService.cs
    public async Task<bool> UpdateApplicationStatusAsync(Guid userId, Guid applicationId, ApplicationStatus status)
    {
        // 1. Tìm công ty gắn liền với tài khoản đang đăng nhập
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
        if (company == null) return false;

        // 2. Lấy thông tin đơn ứng tuyển kèm theo thông tin bài đăng
        var application = await _context.Applications
            .Include(a => a.JobPost)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null) return false;

        // 3. Kiểm tra bảo mật chéo: Tin tuyển dụng này phải thuộc về công ty của người đang gọi API
        if (application.JobPost.CompanyId != company.Id) return false;

        // 4. Cập nhật trạng thái và lưu xuống Database
        application.Status = status;
        _context.Applications.Update(application);
        await _context.SaveChangesAsync();
        
        return true;
    }
}