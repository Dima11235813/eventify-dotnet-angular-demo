using EventManagement.Application;
using EventManagement.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace EventManagement.Presentation.Controllers;

[ApiController]
[Route("events")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    /// <summary>
    /// Returns sample metadata for any event id (mock endpoint for OpenAPI/Swagger visibility).
    /// </summary>
    /// <param name="id">Event id (ignored)</param>
    /// <returns>Sample EventMetaDataDto</returns>
    [HttpGet("{id}/metadata")]
    public ActionResult<EventMetaDataDto> GetEventMetadata(Guid id)
    {
        var sample = new EventMetaDataDto
        {
            EventId = id,
            Title = "Sample Event",
            Description = "This is a sample event used for API documentation and UI testing.",
            Organizer = "Eventify Team",
            Location = "Online",
            StartDate = DateTimeOffset.UtcNow.AddDays(7),
            EndDate = DateTimeOffset.UtcNow.AddDays(7).AddHours(2),
            AttendeeCount = 42,
            Capacity = 100,
            IsOnline = true,
            EventUrl = "https://example.com/events/sample",
            Tags = new List<string> { "tech", "webinar" },
            Category = "Technology",
            ImageUrl = "https://picsum.photos/seed/eventify/600/400",
            Price = 0,
            Currency = "USD",
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-3),
            UpdatedAt = DateTimeOffset.UtcNow,
            Status = "Upcoming"
        };

        return Ok(sample);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllEvents([FromQuery] string? userId)
    {
        var events = await _eventService.GetAllEventsAsync(userId);
        return Ok(events);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEventById(Guid id, [FromQuery] string? userId)
    {
        var @event = await _eventService.GetEventByIdAsync(id, userId);
        if (@event == null)
            return NotFound();

        return Ok(@event);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto createEventDto)
    {
        try
        {
            var @event = await _eventService.CreateEventAsync(createEventDto);
            return CreatedAtAction(nameof(GetEventById), new { id = @event.Id }, @event);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] UpdateEventDto updateEventDto)
    {
        try
        {
            var @event = await _eventService.UpdateEventAsync(id, updateEventDto);
            return Ok(@event);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        try
        {
            await _eventService.DeleteEventAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/register")]
    public async Task<IActionResult> RegisterForEvent(Guid id, [FromBody] RegistrationDto registrationDto)
    {
        try
        {
            await _eventService.RegisterForEventAsync(id, registrationDto.UserId);
            return Ok();
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Event not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}/register")]
    public async Task<IActionResult> UnregisterFromEvent(Guid id, [FromBody] RegistrationDto registrationDto)
    {
        try
        {
            await _eventService.UnregisterFromEventAsync(id, registrationDto.UserId);
            return Ok();
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Event not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

