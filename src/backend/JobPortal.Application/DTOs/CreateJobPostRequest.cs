// File: JobPortal.Application/DTOs/CreateJobPostRequest.cs
using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTOs;

public class CreateJobPostRequest
{
    public string Title { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public JobLevel JobLevel { get; set; }
    public WorkType WorkType { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public bool IsNegotiable { get; set; } = false;
    public string Description { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string Benefits { get; set; } = string.Empty;
    public DateTime ExpirationDate { get; set; }
    
    // Mảng chứa ID của Kỹ năng và Địa điểm được chọn
    public List<int> SkillIds { get; set; } = new List<int>();
    public List<int> LocationIds { get; set; } = new List<int>();
}