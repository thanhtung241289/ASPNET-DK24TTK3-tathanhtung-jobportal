    // File: JobPortal.Domain/Entities/Location.cs
namespace JobPortal.Domain.Entities;

public class Location
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public virtual ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();
}