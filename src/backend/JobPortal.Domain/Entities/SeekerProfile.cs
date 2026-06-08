// File: JobPortal.Domain/Entities/SeekerProfile.cs
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class SeekerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime? Dob { get; set; }
    public Gender? Gender { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? AvatarUrl { get; set; }
    // File: JobPortal.Domain/Entities/SeekerProfile.cs
    public string? Title { get; set; }          // Ví dụ: Fullstack Developer
    public string? Experience { get; set; }     // Mô tả kinh nghiệm làm việc
    public string? Education { get; set; }      // Học vấn (Trường học, bằng cấp)
    public string? SkillsSummary { get; set; }  // Tóm tắt kỹ năng chính
    public string? Description { get; set; }           // Tóm tắt bản thân (nếu muốn)

    // Navigation Properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
    public virtual ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
}