using EventManagement.Domain;

namespace EventManagement.Infrastructure;

public interface IEventStore
{
    Task<Event?> GetByIdAsync(Guid id);
    Task<IEnumerable<Event>> GetAllAsync();
    Task AddAsync(Event @event);
    Task UpdateAsync(Event @event);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
}

