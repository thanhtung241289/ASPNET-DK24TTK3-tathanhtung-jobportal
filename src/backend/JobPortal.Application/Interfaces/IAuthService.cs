// File: JobPortal.Application/Interfaces/IAuthService.cs
using JobPortal.Application.DTOs;

namespace JobPortal.Application.Interfaces;

public record LoginResponse(string Token, string Role);

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(string email, string password);
    Task<bool> RegisterAsync(RegisterRequest request);
}