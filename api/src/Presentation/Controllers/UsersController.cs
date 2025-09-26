using EventManagement.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace EventManagement.Presentation.Controllers;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    // Mock current user endpoint
    [HttpGet("me")]
    public ActionResult<UserDto> GetCurrentUser()
    {
        // This will later be replaced by real auth context
        var user = new UserDto(
            Id: "user-demo-001",
            Name: "Demo User",
            Email: "demo@example.com"
        );
        return Ok(user);
    }
}


