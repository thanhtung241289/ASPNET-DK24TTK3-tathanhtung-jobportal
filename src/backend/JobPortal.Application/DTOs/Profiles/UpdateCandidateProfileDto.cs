// File: JobPortal.Application/DTOs/Profiles/UpdateCandidateProfileDto.cs
namespace JobPortal.Application.DTOs.Profiles;

public class UpdateCandidateProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty; // Ví dụ: ".NET Developer"
    public string Experience { get; set; } = string.Empty;
    public string Education { get; set; } = string.Empty;
    public string SkillsSummary { get; set; } = string.Empty;
}