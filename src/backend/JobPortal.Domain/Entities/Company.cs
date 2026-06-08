// File: JobPortal.Domain/Entities/Company.cs
namespace JobPortal.Domain.Entities;

public class Company
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string? ShortDescription { get; set; }
    public string? Address { get; set; }
    public string? CompanySize { get; set; }
    public string? Website { get; set; }
    public bool IsVerified { get; set; } = false;
    public bool IsLocked { get; set; } = false; // Admin có thể khóa tài khoản công ty

    public string? Description { get; set; } // Mô tả chi tiết về công ty, có thể chứa HTML hoặc Markdown

    // Navigation Properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();
}