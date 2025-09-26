using EventManagement.Application.Dtos;
using EventManagement.Domain;
using EventManagement.Infrastructure;

namespace EventManagement.Application;

public class EventService : IEventService
{
    private readonly IEventStore _eventStore;
    private readonly EventManagement.Infrastructure.IUserRegistrationStore _registrationStore;

    public EventService(IEventStore eventStore, EventManagement.Infrastructure.IUserRegistrationStore registrationStore)
    {
        _eventStore = eventStore;
        _registrationStore = registrationStore;
    }

    public async Task<EventDto?> GetEventByIdAsync(Guid id, string? userId = null)
    {
        var @event = await _eventStore.GetByIdAsync(id);
        return @event == null ? null : MapToDto(@event, userId);
    }

    public async Task<IEnumerable<EventDto>> GetAllEventsAsync(string? userId = null)
    {
        var events = await _eventStore.GetAllAsync();
        return events
            .OrderByDescending(e => e.Date)
            .Select(e => MapToDto(e, userId));
    }

    public async Task<EventDto> CreateEventAsync(CreateEventDto createEventDto)
    {
        var @event = new Event(
            Guid.NewGuid(),
            createEventDto.Title,
            createEventDto.Description,
            createEventDto.Date,
            createEventDto.MaxCapacity
        );

        await _eventStore.AddAsync(@event);
        return MapToDto(@event, null);
    }

    public async Task<EventDto> UpdateEventAsync(Guid id, UpdateEventDto updateEventDto)
    {
        var @event = await _eventStore.GetByIdAsync(id);
        if (@event == null)
            throw new KeyNotFoundException("Event not found");

        @event.Update(
            updateEventDto.Title,
            updateEventDto.Description,
            updateEventDto.Date,
            updateEventDto.MaxCapacity
        );

        await _eventStore.UpdateAsync(@event);
        return MapToDto(@event, null);
    }

    public async Task DeleteEventAsync(Guid id)
    {
        var @event = await _eventStore.GetByIdAsync(id);
        if (@event == null)
            throw new KeyNotFoundException("Event not found");

        await _eventStore.DeleteAsync(id);
    }

    public async Task RegisterForEventAsync(Guid eventId, string userId)
    {
        var @event = await _eventStore.GetByIdAsync(eventId);
        if (@event == null)
            throw new KeyNotFoundException("Event not found");

        @event.RegisterUser(userId);
        await _eventStore.UpdateAsync(@event);
        await _registrationStore.RegisterAsync(userId, eventId);
    }

    public async Task UnregisterFromEventAsync(Guid eventId, string userId)
    {
        var @event = await _eventStore.GetByIdAsync(eventId);
        if (@event == null)
            throw new KeyNotFoundException("Event not found");

        @event.UnregisterUser(userId);
        await _eventStore.UpdateAsync(@event);
        await _registrationStore.UnregisterAsync(userId, eventId);
    }

    public static EventDto MapToDto(Event @event, string? userId)
    {
        return new EventDto(
            @event.Id,
            @event.Title,
            @event.Description,
            @event.Date,
            @event.MaxCapacity,
            @event.RegisteredCount,
            userId == null ? false : @event.IsUserRegistered(userId)
        );
    }
}

