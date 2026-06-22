// File: JobPortal.Application/Interfaces/IJobService.cs
using JobPortal.Application.DTOs;
using JobPortal.Application.DTOs.Search;
using JobPortal.Domain.Entities;
namespace JobPortal.Application.Interfaces;

public interface IJobService
{
    Task<Guid?> CreateJobPostAsync(Guid userId, CreateJobPostRequest request);
    Task<PagedResult<JobPost>> SearchJobsAsync(JobSearchFilter filter);

    Task<bool> ApproveJobPostAsync(Guid jobId, ApproveJobRequest request);
    Task<IEnumerable<object>> GetPendingJobsAsync();
    Task<object?> GetJobPostDetailAsync(Guid jobId);
    Task<IEnumerable<object>> GetEmployerJobsAsync(Guid userId);
    Task<bool> UpdateJobPostAsync(Guid userId, Guid jobId, CreateJobPostRequest request);
    Task<bool> DeleteJobPostAsync(Guid userId, Guid jobId);
    Task<Skill> CreateSkillAsync(string name);
}