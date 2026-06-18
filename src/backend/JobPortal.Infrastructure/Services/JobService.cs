// File: JobPortal.Infrastructure/Services/JobService.cs
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using JobPortal.Application.DTOs.Search;
using JobPortal.Domain.Enums;

namespace JobPortal.Infrastructure.Services;

public class JobService : IJobService
{
    private readonly JobPortalDbContext _context;

    public JobService(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<Guid?> CreateJobPostAsync(Guid userId, CreateJobPostRequest request)
    {
        // 1. Tìm hồ sơ Công ty dựa trên UserId của người đang đăng nhập
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
        if (company == null) return null; // Chưa có hồ sơ công ty

        // 2. Map dữ liệu cơ bản
        var jobPost = new JobPost
        {
            CompanyId = company.Id,
            CategoryId = request.CategoryId,
            Title = request.Title,
            JobLevel = request.JobLevel,
            WorkType = request.WorkType,
            Quantity = request.Quantity,
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            IsNegotiable = request.IsNegotiable,
            Description = request.Description,
            Requirements = request.Requirements,
            Benefits = request.Benefits,
            ExpirationDate = request.ExpirationDate,
            Status = Domain.Enums.JobStatus.Pending // Mặc định chờ Admin duyệt
        };

        // 3. Lấy danh sách Skills từ Database và gán vào Navigation Property
        if (request.SkillIds.Any())
        {
            var skills = await _context.Skills.Where(s => request.SkillIds.Contains(s.Id)).ToListAsync();
            jobPost.Skills = skills;
        }

        // 4. Lấy danh sách Locations từ Database và gán vào Navigation Property
        if (request.LocationIds.Any())
        {
            var locations = await _context.Locations.Where(l => request.LocationIds.Contains(l.Id)).ToListAsync();
            jobPost.Locations = locations;
        }

        // 5. Lưu vào DB (EF Core sẽ lo vụ bảng trung gian)
        _context.JobPosts.Add(jobPost);
        await _context.SaveChangesAsync();

        return jobPost.Id;
    }

    public async Task<PagedResult<JobPost>> SearchJobsAsync(JobSearchFilter filter)
    {
        // 1. Tạo Query gốc, lấy các tin đã được duyệt (Published)
        var query = _context.JobPosts
            .Include(j => j.Company)
            .Include(j => j.Category)
            .Include(j => j.Skills)
            .Include(j => j.Locations)
            .Where(j => j.Status == JobStatus.Published)
            .AsNoTracking() // Tăng tốc độ đọc dữ liệu vì không cần theo dõi trạng thái thay đổi
            .AsQueryable();

        // 2. Lọc theo Từ khóa (Keyword) nếu có
        if (!string.IsNullOrWhiteSpace(filter.Keyword))
        {
            var keyword = filter.Keyword.Trim().ToLower();
            query = query.Where(j => j.Title.ToLower().Contains(keyword) || 
                                    j.Company.CompanyName.ToLower().Contains(keyword) ||
                                    j.Category.Name.ToLower().Contains(keyword) ||
                                    j.Skills.Any(s => s.Name.ToLower().Contains(keyword)) ||
                                    j.Locations.Any(l => l.Name.ToLower().Contains(keyword)));
        }

        // 3. Lọc theo Ngành nghề (Category)
        if (filter.CategoryId.HasValue)
        {
            query = query.Where(j => j.CategoryId == filter.CategoryId.Value);
        }

        // 4. Lọc theo Cấp bậc (JobLevel)
        if (filter.JobLevel.HasValue)
        {
            query = query.Where(j => j.JobLevel == filter.JobLevel.Value);
        }

        // 5. Lọc theo Hình thức làm việc (WorkType)
        if (filter.WorkType.HasValue)
        {
            query = query.Where(j => j.WorkType == filter.WorkType.Value);
        }

        // 6. Lọc theo Địa điểm (Thông qua bảng trung gian Many-to-Many)
        if (filter.LocationId.HasValue)
        {
            query = query.Where(j => j.Locations.Any(l => l.Id == filter.LocationId.Value));
        }

        // 7. Lọc theo Mức lương
        if (filter.MinSalary.HasValue)
        {
            query = query.Where(j => j.IsNegotiable || j.SalaryMax >= filter.MinSalary.Value);
        }

        // 8. Đếm tổng số bản ghi thỏa mãn điều kiện lọc (trước khi phân trang)
        var totalItems = await query.CountAsync();

        // 9. Thực hiện Phân trang và Sắp xếp tin mới nhất lên đầu
        var items = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResult<JobPost>(items, totalItems, filter.PageNumber, filter.PageSize);
    }

    public async Task<IEnumerable<object>> GetPendingJobsAsync()
    {
        return await _context.JobPosts
            .Include(j => j.Company)
            .Include(j => j.Category)
            .Where(j => j.Status == JobStatus.Pending)
            .OrderBy(j => j.CreatedAt)
            .Select(j => new
            {
                j.Id,
                j.Title,
                CompanyName = j.Company.CompanyName,
                CategoryName = j.Category.Name,
                j.CreatedAt,
                j.ExpirationDate
            })
            .ToListAsync();
    }

    public async Task<bool> ApproveJobPostAsync(Guid jobId, ApproveJobRequest request)
    {
        var jobPost = await _context.JobPosts.FirstOrDefaultAsync(j => j.Id == jobId);
        if (jobPost == null) return false;

        // Chỉ cho phép duyệt các tin đang ở trạng thái Chờ duyệt (Pending)
        if (jobPost.Status != JobStatus.Pending) return false;

        // Nếu từ chối, có thể đính kèm lý do vào đầu phần mô tả hoặc lưu vết hệ thống
        if (request.Status == JobStatus.Rejected && !string.IsNullOrWhiteSpace(request.RejectReason))
        {
            jobPost.Description = $"<p style='color:red;'><b>Lý do từ chối kiểm duyệt:</b> {request.RejectReason}</p><hr/>" + jobPost.Description;
        }

        jobPost.Status = request.Status;
        
        _context.JobPosts.Update(jobPost);
        await _context.SaveChangesAsync();
        return true;
    }

    // Thêm vào JobService.cs
    public async Task<object?> GetJobPostDetailAsync(Guid jobId)
    {
        var job = await _context.JobPosts
            .Include(j => j.Company)
            .Include(j => j.Category)
            .Include(j => j.Skills)
            .Include(j => j.Locations)
            .AsNoTracking()
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null) return null;

        // Trả về một Object ẩn danh đã custom cấu trúc trực quan cho Frontend dễ dùng
        return new
        {
            job.Id,
            job.Title,
            job.Quantity,
            job.SalaryMin,
            job.SalaryMax,
            job.IsNegotiable,
            job.Description,
            job.Requirements,
            job.Benefits,
            job.CreatedAt,
            job.ExpirationDate,
            Status = job.Status.ToString(),
            JobLevel = job.JobLevel.ToString(),
            WorkType = job.WorkType.ToString(),
            Category = new { job.Category.Id, job.Category.Name },
            Company = new { job.Company.Id, job.Company.CompanyName, job.Company.LogoUrl, job.Company.Website, job.Company.Address },
            Skills = job.Skills.Select(s => new { s.Id, s.Name }),
            Locations = job.Locations.Select(l => new { l.Id, l.Name })
        };
    }

    public async Task<IEnumerable<object>> GetEmployerJobsAsync(Guid userId)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
        if (company == null) return Enumerable.Empty<object>();

        return await _context.JobPosts
            .Include(j => j.Category)
            .Include(j => j.Skills)
            .Include(j => j.Locations)
            .Include(j => j.Applications)
            .Where(j => j.CompanyId == company.Id)
            .OrderByDescending(j => j.CreatedAt)
            .Select(j => new
            {
                j.Id,
                j.Title,
                j.Quantity,
                j.SalaryMin,
                j.SalaryMax,
                j.IsNegotiable,
                j.CreatedAt,
                j.ExpirationDate,
                Status = j.Status.ToString(),
                JobLevel = j.JobLevel.ToString(),
                WorkType = j.WorkType.ToString(),
                Category = j.Category != null ? new { j.Category.Id, j.Category.Name } : null,
                Skills = j.Skills.Select(s => new { s.Id, s.Name }),
                Locations = j.Locations.Select(l => new { l.Id, l.Name }),
                ApplicantCount = j.Applications.Count()
            })
            .ToListAsync();
    }
}