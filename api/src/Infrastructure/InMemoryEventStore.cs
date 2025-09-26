using EventManagement.Domain;

namespace EventManagement.Infrastructure;

public class InMemoryEventStore : IEventStore
{
    // Each public method acquires a lock and releases it in a finally block—nice and safe.
    //Clear read vs. write separation: Lookups use EnterReadLock, mutations use EnterWriteLock.
    private readonly Dictionary<Guid, Event> _events = new();
    private readonly ReaderWriterLockSlim _lock = new();

    public InMemoryEventStore()
    {
        // Seed with mock data from EventCatalog
        _lock.EnterWriteLock();
        // Seeding under a write lock: Keeps construction atomic and consistent.
        try
        {
            foreach (var @event in EventRepository.Events)
            {
                // Create a copy of the event to avoid modifying the static readonly instances
                var eventCopy = new Event(@event.Id, @event.Title, @event.Description, @event.Date, @event.MaxCapacity);
                _events[@event.Id] = eventCopy;
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
    /**
    * @param id The ID of the event to get.
    * @returns The event with the given ID, or null if no event with that ID exists.
    * @throws InvalidOperationException if the event is not found.
    */
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

