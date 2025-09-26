using EventManagement.Domain;

namespace EventManagement.Infrastructure;

public class InMemoryEventStore : IEventStore
{
    private readonly Dictionary<Guid, Event> _events = new();
    private readonly ReaderWriterLockSlim _lock = new();

    public InMemoryEventStore()
    {
        // Seed with mock data from EventCatalog
        _lock.EnterWriteLock();
        try
        {
            foreach (var @event in EventRepository.Events)
            {
                _events[@event.Id] = (Event)@event;
            }
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public Task<Event?> GetByIdAsync(Guid id)
    {
        _lock.EnterReadLock();
        try
        {
            return Task.FromResult(_events.TryGetValue(id, out var @event) ? @event : null);
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public Task<IEnumerable<Event>> GetAllAsync()
    {
        _lock.EnterReadLock();
        try
        {
            return Task.FromResult(_events.Values.ToList().AsEnumerable());
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public Task AddAsync(Event @event)
    {
        _lock.EnterWriteLock();
        try
        {
            if (_events.ContainsKey(@event.Id))
                throw new InvalidOperationException("Event already exists");

            _events[@event.Id] = @event;
            return Task.CompletedTask;
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public Task UpdateAsync(Event @event)
    {
        _lock.EnterWriteLock();
        try
        {
            if (!_events.ContainsKey(@event.Id))
                throw new InvalidOperationException("Event not found");

            _events[@event.Id] = @event;
            return Task.CompletedTask;
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public Task DeleteAsync(Guid id)
    {
        _lock.EnterWriteLock();
        try
        {
            _events.Remove(id);
            return Task.CompletedTask;
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public Task<bool> ExistsAsync(Guid id)
    {
        _lock.EnterReadLock();
        try
        {
            return Task.FromResult(_events.ContainsKey(id));
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }
}

