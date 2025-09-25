namespace EventManagement.Domain;

public class Registration
{
    public Guid EventId { get; private set; }
    public string UserId { get; private set; }

    public Registration(Guid eventId, string userId)
    {
        EventId = eventId;
        UserId = userId;
    }
}

