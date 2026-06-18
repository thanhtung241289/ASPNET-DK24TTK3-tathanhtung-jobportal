// File: JobPortal.Domain/Entities/Application.cs
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class Application
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobId { get; set; }
    public Guid SeekerId { get; set; }
    public Guid ResumeId { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.New;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual JobPost JobPost { get; set; } = null!;
    public virtual SeekerProfile SeekerProfile { get; set; } = null!;
    public virtual Resume Resume { get; set; } = null!;
}