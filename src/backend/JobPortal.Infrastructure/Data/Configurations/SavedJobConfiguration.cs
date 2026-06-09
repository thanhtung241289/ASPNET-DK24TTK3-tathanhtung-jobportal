// File: JobPortal.Infrastructure/Data/Configurations/SavedJobConfiguration.cs
using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class SavedJobConfiguration : IEntityTypeConfiguration<SavedJob>
{
    public void Configure(EntityTypeBuilder<SavedJob> builder)
    {
        // Cấu hình Khóa phức hợp (Composite Key) gồm 2 khóa ngoại
        builder.HasKey(s => new { s.SeekerId, s.JobId });

        builder.HasOne(s => s.SeekerProfile)
            .WithMany(sp => sp.SavedJobs)
            .HasForeignKey(s => s.SeekerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.JobPost)
            .WithMany(j => j.SavedBySeekers)
            .HasForeignKey(s => s.JobId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}