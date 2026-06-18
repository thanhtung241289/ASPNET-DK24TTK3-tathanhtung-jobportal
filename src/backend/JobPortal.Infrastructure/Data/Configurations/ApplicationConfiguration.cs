// File: JobPortal.Infrastructure/Data/Configurations/ApplicationConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<Domain.Entities.Application>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Application> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Status).HasConversion<int>();

        builder.HasOne(a => a.JobPost)
            .WithMany(j => j.Applications)
            .HasForeignKey(a => a.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.SeekerProfile)
            .WithMany(s => s.Applications)
            .HasForeignKey(a => a.SeekerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Resume)
            .WithMany(r => r.Applications)
            .HasForeignKey(a => a.ResumeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}