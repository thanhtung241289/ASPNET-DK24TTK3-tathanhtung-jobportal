// File: JobPortal.API/Controllers/AuthController.cs
using JobPortal.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result)
            return BadRequest(new { message = "Email đã tồn tại hoặc có lỗi xảy ra." });

        return Ok(new { message = "Đăng ký thành công!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var loginResponse = await _authService.LoginAsync(request.Email, request.Password);
        if (loginResponse == null)
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });

        return Ok(new { 
            token = loginResponse.Token, 
            role = loginResponse.Role, 
            message = "Đăng nhập thành công!" 
        });
    }
}