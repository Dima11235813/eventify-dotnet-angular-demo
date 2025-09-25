namespace EventManagement.Application.Dtos;

public record RegistrationDto(
    Guid EventId,
    string UserId
);