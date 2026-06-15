// File: JobPortal.Application/DTOs/Search/JobSearchFilter.cs
using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTOs.Search;

public class JobSearchFilter
{
    public string? Keyword { get; set; }        // Tìm theo tiêu đề hoặc tên công ty
    public int? CategoryId { get; set; }        // Lọc theo ngành nghề
    public JobLevel? JobLevel { get; set; }     // Lọc theo cấp bậc (Intern, Junior...)
    public WorkType? WorkType { get; set; }     // Lọc theo hình thức (Full-time, Remote...)
    public int? LocationId { get; set; }       // Lọc theo tỉnh thành
    public decimal? MinSalary { get; set; }     // Lọc mức lương tối thiểu
    
    // Cấu hình phân trang (Mặc định trang 1, mỗi trang 10 bài)
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}