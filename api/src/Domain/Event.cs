namespace EventManagement.Domain;

public interface IEvent
{
    string Title { get; }
    string Description { get; }
    DateTimeOffset Date { get; }
    int MaxCapacity { get; }
}

public class Event : IEvent
{
    public Guid Id { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public DateTimeOffset Date { get; private set; }
    public int MaxCapacity { get; private set; }
    private readonly List<Registration> _registrations = new();
    public IReadOnlyCollection<Registration> Registrations => _registrations.AsReadOnly();

    public int RegisteredCount => _registrations.Count;

    public Event(Guid id, string title, string? description, DateTimeOffset date, int maxCapacity)
    {
        Id = id;
        Title = title;
        Description = description;
        Date = date;
        MaxCapacity = maxCapacity;
    }

    public void Update(string title, string? description, DateTimeOffset date, int maxCapacity)
    {
        Title = title;
        Description = description;
        Date = date;
        MaxCapacity = maxCapacity;
    }

    public bool CanRegister() => RegisteredCount < MaxCapacity && Date > DateTimeOffset.Now;

    public bool IsUserRegistered(string userId) => _registrations.Any(r => r.UserId == userId);

    public void RegisterUser(string userId)
    {
        if (!CanRegister())
            throw new InvalidOperationException("Cannot register for this event");

        if (IsUserRegistered(userId))
            throw new InvalidOperationException("User is already registered for this event");

        _registrations.Add(new Registration(Id, userId));
    }

    public void UnregisterUser(string userId)
    {
        var registration = _registrations.FirstOrDefault(r => r.UserId == userId);
        if (registration == null)
            throw new InvalidOperationException("User is not registered for this event");

        _registrations.Remove(registration);
    }
}

