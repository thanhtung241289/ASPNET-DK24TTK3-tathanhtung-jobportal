// File: JobPortal.Infrastructure/Data/Configurations/SeekerProfileConfiguration.cs
using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class SeekerProfileConfiguration : IEntityTypeConfiguration<SeekerProfile>
{
    public void Configure(EntityTypeBuilder<SeekerProfile> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.FullName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(s => s.Phone)
            .HasMaxLength(20);

        builder.Property(s => s.Address)
            .HasMaxLength(500);

        builder.Property(s => s.Gender)
            .HasConversion<int>();

        // Cấu hình mối quan hệ 1-1 với User
        builder.HasOne(s => s.User)
            .WithOne(u => u.SeekerProfile)
            .HasForeignKey<SeekerProfile>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade); // Xóa User thì tự động xóa Profile
    }
}