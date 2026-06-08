// File: JobPortal.Domain/Entities/User.cs
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual SeekerProfile? SeekerProfile { get; set; }
    public virtual Company? Company { get; set; }
}