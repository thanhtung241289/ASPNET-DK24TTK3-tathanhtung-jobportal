// File: JobPortal.Application/Interfaces/IProfileService.cs
using JobPortal.Application.DTOs.Profiles;

namespace JobPortal.Application.Interfaces;

public interface IProfileService
{
    Task<object?> GetProfileAsync(Guid userId, string role);
    Task<bool> UpdateCandidateProfileAsync(Guid userId, UpdateCandidateProfileDto dto);
    Task<bool> UpdateEmployerProfileAsync(Guid userId, UpdateEmployerProfileDto dto);
}