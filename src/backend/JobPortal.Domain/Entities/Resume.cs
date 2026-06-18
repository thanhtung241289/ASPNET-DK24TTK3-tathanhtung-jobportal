// File: JobPortal.Domain/Entities/Resume.cs
namespace JobPortal.Domain.Entities;

public class Resume
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SeekerId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public bool IsDefault { get; set; } = false;

    // Navigation Properties
    public virtual SeekerProfile SeekerProfile { get; set; } = null!;
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
}