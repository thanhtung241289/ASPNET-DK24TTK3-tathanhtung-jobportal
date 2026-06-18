// File: JobPortal.Infrastructure/Data/Configurations/JobPostConfiguration.cs
using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class JobPostConfiguration : IEntityTypeConfiguration<JobPost>
{
    public void Configure(EntityTypeBuilder<JobPost> builder)
    {
        builder.HasKey(j => j.Id);

        builder.Property(j => j.Title)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(j => j.SalaryMin)
            .HasPrecision(18, 2); // Chỉ định độ chính xác cho tiền tệ

        builder.Property(j => j.SalaryMax)
            .HasPrecision(18, 2);

        builder.Property(j => j.JobLevel).HasConversion<int>();
        builder.Property(j => j.WorkType).HasConversion<int>();
        builder.Property(j => j.Status).HasConversion<int>();

        // Cấu hình quan hệ 1-N với Company
        builder.HasOne(j => j.Company)
            .WithMany(c => c.JobPosts)
            .HasForeignKey(j => j.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cấu hình quan hệ 1-N với Category
        builder.HasOne(j => j.Category)
            .WithMany(c => c.JobPosts)
            .HasForeignKey(j => j.CategoryId)
            .OnDelete(DeleteBehavior.Restrict); // Không cho xóa Category nếu đang có bài đăng thuộc category đó

        // Cấu hình quan hệ Nhiều-Nhiều (Many-to-Many) tự động sinh bảng trung gian
        builder.HasMany(j => j.Skills)
            .WithMany(s => s.JobPosts)
            .UsingEntity(j => j.ToTable("JobSkills"));

        builder.HasMany(j => j.Locations)
            .WithMany(l => l.JobPosts)
            .UsingEntity(j => j.ToTable("JobLocations"));
    }
}