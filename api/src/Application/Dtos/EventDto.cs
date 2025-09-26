namespace EventManagement.Application.Dtos;

public record EventDto(
    Guid Id,
    string Title,
    string? Description,
    DateTimeOffset Date,
    int MaxCapacity,
    int RegisteredCount,
    bool IsRegistered
);
