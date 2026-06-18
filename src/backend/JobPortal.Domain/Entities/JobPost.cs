// File: JobPortal.Domain/Entities/JobPost.cs
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class JobPost
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
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
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual Company Company { get; set; } = null!;
    public virtual Category Category { get; set; } = null!;
    public virtual ICollection<Skill> Skills { get; set; } = new List<Skill>();
    public virtual ICollection<Location> Locations { get; set; } = new List<Location>();
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
    public virtual ICollection<SavedJob> SavedBySeekers { get; set; } = new List<SavedJob>();
}