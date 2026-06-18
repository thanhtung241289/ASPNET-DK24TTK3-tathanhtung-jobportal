// File: JobPortal.Infrastructure/Services/ApplicationService.cs
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;
using JobPortal.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Services;

public class ApplicationService : IApplicationService
{
    private readonly JobPortalDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ApplicationService(JobPortalDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<Guid?> UploadResumeAsync(Guid userId, UploadResumeDto dto)
    {
        // 1. Kiểm tra ứng viên đã có Profile chưa
        var profile = await _context.SeekerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return null;

        // 2. Validate File (Chỉ nhận PDF, DOC, DOCX và < 5MB)
        var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
        var extension = Path.GetExtension(dto.File.FileName).ToLower();
        
        if (!allowedExtensions.Contains(extension) || dto.File.Length > 5 * 1024 * 1024)
            throw new Exception("Định dạng file không hợp lệ hoặc vượt quá 5MB.");

        // 3. Tạo thư mục lưu trữ nếu chưa có
        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "resumes");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        // 4. Đổi tên file chống trùng lặp (Sử dụng Guid)
        var uniqueFileName = $"{Guid.NewGuid()}_{dto.File.FileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // 5. Copy luồng byte vật lý vào máy chủ
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await dto.File.CopyToAsync(fileStream);
        }

        // 6. Lưu thông tin vào Database
        var resume = new Resume
        {
            SeekerId = profile.Id,
            SeekerProfile = profile,
            FileName = dto.File.FileName,
            // Giả lập URL tĩnh trả về Frontend (Nếu dùng Domain thật thì thay thế)
            FileUrl = $"/resumes/{uniqueFileName}",
            IsDefault = !await _context.Resumes.AnyAsync(r => r.SeekerId == profile.Id) // File đầu tiên tự làm mặc định
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

    // File: JobPortal.Infrastructure/Services/ApplicationService.cs

public async Task<object?> GetResumesByUserIdAsync(Guid userId)
{
    // 1. Tìm hồ sơ ứng viên tương ứng với tài khoản đăng nhập
    var profile = await _context.SeekerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
    if (profile == null) return new List<object>();

    // 2. Lấy danh sách CV và trả về Object vô danh (ẩn đi các trường không cần thiết)
    var resumes = await _context.Resumes
        .Where(r => r.SeekerId == profile.Id)
        .OrderByDescending(r => r.IsDefault) // Ưu tiên CV mặc định lên đầu
        .Select(r => new {
            r.Id,
            r.FileName,
            r.FileUrl,
            r.IsDefault,
            uploadedAt = r.CreatedAt
        })
        .ToListAsync();

    return resumes;
}

public async Task<bool> SetDefaultResumeAsync(Guid userId, Guid resumeId)
{
    var profile = await _context.SeekerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
    if (profile == null) return false;

    // Lấy toàn bộ CV của ứng viên này
    var resumes = await _context.Resumes.Where(r => r.SeekerId == profile.Id).ToListAsync();
    
    var targetResume = resumes.FirstOrDefault(r => r.Id == resumeId);
    if (targetResume == null) return false;

    // Chuyển toàn bộ các CV khác về trạng thái Không mặc định (false)
    foreach (var res in resumes)
    {
        res.IsDefault = false;
    }

    // Gắn nhãn Mặc định (true) cho CV được chọn
    targetResume.IsDefault = true;

    await _context.SaveChangesAsync();
    return true;
}

public async Task<bool> DeleteResumeAsync(Guid userId, Guid resumeId)
{
    var profile = await _context.SeekerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
    if (profile == null) return false;

    // Tìm CV cần xóa, đảm bảo CV này phải thuộc về người đang thao tác
    var resume = await _context.Resumes.FirstOrDefaultAsync(r => r.Id == resumeId && r.SeekerId == profile.Id);
    if (resume == null) return false;

    // QUAN TRỌNG: Xóa file vật lý trong thư mục wwwroot để tránh rác server
    if (!string.IsNullOrEmpty(resume.FileUrl))
    {
        var fileName = Path.GetFileName(resume.FileUrl);
        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "resumes");
        var filePath = Path.Combine(uploadsFolder, fileName);
        
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }

    // Xóa bản ghi trong Database
    _context.Resumes.Remove(resume);
    await _context.SaveChangesAsync();
    
    return true;
}

public async Task<IEnumerable<object>> GetApplicationsForEmployerAsync(Guid userId)
{
    var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
    if (company == null) return Enumerable.Empty<object>();

    return await _context.Applications
        .Include(a => a.JobPost)
        .Include(a => a.SeekerProfile)
            .ThenInclude(s => s.User)
        .Include(a => a.Resume)
        .Where(a => a.JobPost.CompanyId == company.Id)
        .OrderByDescending(a => a.AppliedAt)
        .Select(a => new
        {
            a.Id,
            a.JobId,
            JobTitle = a.JobPost.Title,
            CandidateName = a.SeekerProfile.FullName,
            CandidateEmail = a.SeekerProfile.User.Email,
            CandidatePhone = a.SeekerProfile.Phone,
            ResumeUrl = a.Resume.FileUrl,
            ResumeFileName = a.Resume.FileName,
            a.AppliedAt,
            Status = a.Status.ToString()
        })
        .ToListAsync();
}
}