// File: JobPortal.Application/DTOs/Profiles/UpdateEmployerProfileDto.cs
namespace JobPortal.Application.DTOs.Profiles;

public class UpdateEmployerProfileDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
}