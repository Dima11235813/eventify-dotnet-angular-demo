using EventManagement.Application.Dtos;

namespace EventManagement.Application;

public interface IEventService
{
    Task<EventDto?> GetEventByIdAsync(Guid id, string? userId = null);
    Task<IEnumerable<EventDto>> GetAllEventsAsync(string? userId = null);
    Task<EventDto> CreateEventAsync(CreateEventDto createEventDto);
    Task<EventDto> UpdateEventAsync(Guid id, UpdateEventDto updateEventDto);
    Task DeleteEventAsync(Guid id);
    Task RegisterForEventAsync(Guid eventId, string userId);
    Task UnregisterFromEventAsync(Guid eventId, string userId);
}

