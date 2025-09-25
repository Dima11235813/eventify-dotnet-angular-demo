namespace EventManagement.Application.Dtos;

public record UpdateEventDto(
    string Title,
    string? Description,
    DateTimeOffset Date,
    int MaxCapacity
);

