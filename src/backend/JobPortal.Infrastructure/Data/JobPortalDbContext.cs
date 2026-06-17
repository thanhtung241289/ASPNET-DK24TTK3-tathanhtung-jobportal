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

    // File: JobPortal.Infrastructure/Data/JobPortalDbContext.cs
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); 

        // Tự động quét các file cấu hình đơn lẻ
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // 1. Seed dữ liệu bảng Ngành nghề (Categories)
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Công nghệ thông tin / Phần mềm" },
            new Category { Id = 2, Name = "Marketing / Truyền thông" },
            new Category { Id = 3, Name = "Kế toán / Kiểm toán" },
            new Category { Id = 4, Name = "Quản trị nhân sự" },
            new Category { Id = 5, Name = "Kinh doanh / Bán hàng" }
        );

        // 2. Seed dữ liệu bảng Địa điểm (Locations)
        modelBuilder.Entity<Location>().HasData(
            new Location { Id = 1, Name = "Hồ Chí Minh" },
            new Location { Id = 2, Name = "Hà Nội" },
            new Location { Id = 3, Name = "Đà Nẵng" },
            new Location { Id = 4, Name = "Cần Thơ" },
            new Location { Id = 5, Name = "Remote (Làm việc từ xa)" }
        );

        // 3. Seed dữ liệu bảng Kỹ năng mẫu (Skills)
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 1, Name = ".NET / C#" },
            new Skill { Id = 2, Name = "ReactJS / JavaScript" },
            new Skill { Id = 3, Name = "SQL Server" },
            new Skill { Id = 4, Name = "Golang" },
            new Skill { Id = 5, Name = "Flutter / Dart" },
            new Skill { Id = 6, Name = "Docker / Devops" }
        );
    }
}