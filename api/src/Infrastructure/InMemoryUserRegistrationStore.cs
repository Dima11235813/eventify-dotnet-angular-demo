namespace EventManagement.Infrastructure;

public class InMemoryUserRegistrationStore : IUserRegistrationStore
{
    private readonly Dictionary<string, HashSet<Guid>> _userToEventIds = new();
    private readonly ReaderWriterLockSlim _lock = new();

    public Task<bool> IsRegisteredAsync(string userId, Guid eventId)
    {
        _lock.EnterReadLock();
        try
        {
            return Task.FromResult(_userToEventIds.TryGetValue(userId, out var set) && set.Contains(eventId));
        }
        finally { _lock.ExitReadLock(); }
    }

    public Task RegisterAsync(string userId, Guid eventId)
    {
        _lock.EnterWriteLock();
        try
        {
            if (!_userToEventIds.TryGetValue(userId, out var set))
            {
                set = new HashSet<Guid>();
                _userToEventIds[userId] = set;
            }
            set.Add(eventId);
            return Task.CompletedTask;
        }
        finally { _lock.ExitWriteLock(); }
    }

    public Task UnregisterAsync(string userId, Guid eventId)
    {
        _lock.EnterWriteLock();
        try
        {
            if (_userToEventIds.TryGetValue(userId, out var set))
            {
                set.Remove(eventId);
            }
            return Task.CompletedTask;
        }
        finally { _lock.ExitWriteLock(); }
    }

    public Task<IReadOnlyCollection<Guid>> GetRegistrationsAsync(string userId)
    {
        _lock.EnterReadLock();
        try
        {
            if (_userToEventIds.TryGetValue(userId, out var set))
            {
                return Task.FromResult((IReadOnlyCollection<Guid>)set.ToList());
            }
            return Task.FromResult((IReadOnlyCollection<Guid>)Array.Empty<Guid>());
        }
        finally { _lock.ExitReadLock(); }
    }
}


