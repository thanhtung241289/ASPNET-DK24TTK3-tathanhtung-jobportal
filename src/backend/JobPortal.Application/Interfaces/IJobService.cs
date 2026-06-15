// File: JobPortal.Application/Interfaces/IJobService.cs
using JobPortal.Application.DTOs;
using JobPortal.Application.DTOs.Search;
using JobPortal.Domain.Entities;
namespace JobPortal.Application.Interfaces;

public interface IJobService
{
    Task<Guid?> CreateJobPostAsync(Guid userId, CreateJobPostRequest request);
    Task<PagedResult<JobPost>> SearchJobsAsync(JobSearchFilter filter);
}