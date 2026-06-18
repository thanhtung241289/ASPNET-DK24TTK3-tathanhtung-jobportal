// File: JobPortal.Application/Interfaces/IAuthService.cs
using JobPortal.Application.DTOs;

namespace JobPortal.Application.Interfaces;

public interface IAuthService
{
    Task<string?> LoginAsync(string email, string password);
    Task<bool> RegisterAsync(RegisterRequest request);
}