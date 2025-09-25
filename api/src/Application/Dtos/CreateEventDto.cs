namespace EventManagement.Application.Dtos;

public record CreateEventDto(
    string Title,
    string? Description,
    DateTimeOffset Date,
    int MaxCapacity
);

