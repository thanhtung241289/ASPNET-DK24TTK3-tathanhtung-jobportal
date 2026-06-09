// File: JobPortal.Infrastructure/Data/JobPortalDbContext.cs
using System.Reflection;
using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Data;

public class JobPortalDbContext : DbContext
{
    public JobPortalDbContext(DbContextOptions<JobPortalDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<SeekerProfile> SeekerProfiles => Set<SeekerProfile>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<JobPost> JobPosts => Set<JobPost>();

    public DbSet<Domain.Entities.Application> Applications => Set<Domain.Entities.Application>();
    public DbSet<SavedJob> SavedJobs => Set<SavedJob>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tự động quét và áp dụng mọi cấu hình kế thừa từ IEntityTypeConfiguration trong Assembly này
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}