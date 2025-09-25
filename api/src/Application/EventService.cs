using EventManagement.Application.Dtos;
using EventManagement.Domain;
using EventManagement.Infrastructure;

namespace EventManagement.Application;

public class EventService : IEventService
{
    private readonly IEventStore _eventStore;

    public EventService(IEventStore eventStore)
    {
        _eventStore = eventStore;
    }

    public async Task<EventDto?> GetEventByIdAsync(Guid id)
    {
        var @event = await _eventStore.GetByIdAsync(id);
        return @event == null ? null : MapToDto(@event);
    }

    public async Task<IEnumerable<EventDto>> GetAllEventsAsync()
    {
        var events = await _eventStore.GetAllAsync();
        return events.Select(MapToDto);
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
        return MapToDto(@event);
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
        return MapToDto(@event);
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
    }

    public async Task UnregisterFromEventAsync(Guid eventId, string userId)
    {
        var @event = await _eventStore.GetByIdAsync(eventId);
        if (@event == null)
            throw new KeyNotFoundException("Event not found");

        @event.UnregisterUser(userId);
        await _eventStore.UpdateAsync(@event);
    }

    private static EventDto MapToDto(Event @event)
    {
        return new EventDto(
            @event.Id,
            @event.Title,
            @event.Description,
            @event.Date,
            @event.MaxCapacity,
            @event.RegisteredCount
        );
    }
}

