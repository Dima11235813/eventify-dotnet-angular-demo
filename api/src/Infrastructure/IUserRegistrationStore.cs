namespace EventManagement.Infrastructure;

public interface IUserRegistrationStore
{
    Task<bool> IsRegisteredAsync(string userId, Guid eventId);
    Task RegisterAsync(string userId, Guid eventId);
    Task UnregisterAsync(string userId, Guid eventId);
    Task<IReadOnlyCollection<Guid>> GetRegistrationsAsync(string userId);
}


