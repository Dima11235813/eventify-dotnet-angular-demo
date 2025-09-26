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

            // Seed registrations: among FUTURE-dated events, make half fully booked and half with one spot left
            var futureSeedTargets = _events.Values
                .Where(e => e.Date > DateTimeOffset.UtcNow && e.MaxCapacity > 0)
                .OrderBy(e => e.Date)
                .ToList();

            if (futureSeedTargets.Count > 0)
            {
                var half = futureSeedTargets.Count / 2;

                // First half: fill to capacity
                for (var i = 0; i < half; i++)
                {
                    var e = futureSeedTargets[i];
                    var target = e.MaxCapacity;
                    for (var n = 0; n < target; n++)
                    {
                        if (!e.CanRegister()) break;
                        e.RegisterUser($"seed-full-{i}-{n}");
                    }
                }

                // Second half: leave exactly one spot
                for (var i = half; i < futureSeedTargets.Count; i++)
                {
                    var e = futureSeedTargets[i];
                    var target = Math.Max(0, e.MaxCapacity - 1);
                    for (var n = 0; n < target; n++)
                    {
                        if (!e.CanRegister()) break;
                        e.RegisterUser($"seed-oneleft-{i}-{n}");
                    }
                }
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

