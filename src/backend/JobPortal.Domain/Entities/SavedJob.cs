// File: JobPortal.Domain/Entities/SavedJob.cs
namespace JobPortal.Domain.Entities;

public class SavedJob
{
    public Guid SeekerId { get; set; }
    public Guid JobId { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual SeekerProfile SeekerProfile { get; set; } = null!;
    public virtual JobPost JobPost { get; set; } = null!;
}