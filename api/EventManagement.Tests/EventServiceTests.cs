using EventManagement.Application;
using EventManagement.Application.Dtos;
using EventManagement.Domain;
using EventManagement.Infrastructure;
using Xunit;

namespace EventManagement.Tests;

public class EventServiceTests
{
    private readonly IEventStore _eventStore;
    private readonly IEventService _eventService;

    public EventServiceTests()
    {
        _eventStore = new InMemoryEventStore();
        _eventService = new EventService(_eventStore);
    }

    [Fact]
    public async Task GetAllEventsAsync_ReturnsAllEvents()
    {
        // Act
        var events = await _eventService.GetAllEventsAsync();

        // Assert
        Assert.NotNull(events);
        Assert.True(events.Any()); // Should have seeded data
        Assert.All(events, e => Assert.NotNull(e.Title));
    }

    [Fact]
    public async Task GetEventByIdAsync_ExistingEvent_ReturnsEvent()
    {
        // Arrange
        var events = await _eventService.GetAllEventsAsync();
        var firstEvent = events.First();

        // Act
        var result = await _eventService.GetEventByIdAsync(firstEvent.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(firstEvent.Id, result!.Id);
        Assert.Equal(firstEvent.Title, result.Title);
    }

    [Fact]
    public async Task GetEventByIdAsync_NonExistingEvent_ReturnsNull()
    {
        // Act
        var result = await _eventService.GetEventByIdAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateEventAsync_ValidData_CreatesAndReturnsEvent()
    {
        // Arrange
        var createDto = new CreateEventDto(
            "Test Event",
            "Test Description",
            DateTimeOffset.Now.AddDays(30),
            100
        );

        // Act
        var result = await _eventService.CreateEventAsync(createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createDto.Title, result.Title);
        Assert.Equal(createDto.Description, result.Description);
        Assert.Equal(createDto.Date, result.Date);
        Assert.Equal(createDto.MaxCapacity, result.MaxCapacity);
        Assert.Equal(0, result.RegisteredCount);

        // Verify it was added to the store
        var retrieved = await _eventService.GetEventByIdAsync(result.Id);
        Assert.NotNull(retrieved);
        Assert.Equal(result.Id, retrieved!.Id);
    }

    [Fact]
    public async Task UpdateEventAsync_ExistingEvent_UpdatesAndReturnsEvent()
    {
        // Arrange
        var events = await _eventService.GetAllEventsAsync();
        var firstEvent = events.First();
        var updateDto = new UpdateEventDto(
            "Updated Title",
            "Updated Description",
            firstEvent.Date.AddDays(1),
            firstEvent.MaxCapacity + 50
        );

        // Act
        var result = await _eventService.UpdateEventAsync(firstEvent.Id, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(firstEvent.Id, result.Id);
        Assert.Equal(updateDto.Title, result.Title);
        Assert.Equal(updateDto.Description, result.Description);
        Assert.Equal(updateDto.Date, result.Date);
        Assert.Equal(updateDto.MaxCapacity, result.MaxCapacity);
    }

    [Fact]
    public async Task UpdateEventAsync_NonExistingEvent_ThrowsKeyNotFoundException()
    {
        // Arrange
        var updateDto = new UpdateEventDto(
            "Updated Title",
            "Updated Description",
            DateTimeOffset.Now.AddDays(30),
            100
        );

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _eventService.UpdateEventAsync(Guid.NewGuid(), updateDto));
    }

    [Fact]
    public async Task DeleteEventAsync_ExistingEvent_DeletesEvent()
    {
        // Arrange
        var createDto = new CreateEventDto(
            "Event to Delete",
            "Will be deleted",
            DateTimeOffset.Now.AddDays(30),
            50
        );
        var createdEvent = await _eventService.CreateEventAsync(createDto);

        // Act
        await _eventService.DeleteEventAsync(createdEvent.Id);

        // Assert
        var result = await _eventService.GetEventByIdAsync(createdEvent.Id);
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteEventAsync_NonExistingEvent_ThrowsKeyNotFoundException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _eventService.DeleteEventAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task RegisterForEventAsync_ValidRegistration_RegistersUser()
    {
        // Arrange
        var createDto = new CreateEventDto(
            "Registration Test Event",
            "For testing registration",
            DateTimeOffset.Now.AddDays(30),
            10
        );
        var createdEvent = await _eventService.CreateEventAsync(createDto);
        var userId = "test-user-123";

        // Act
        await _eventService.RegisterForEventAsync(createdEvent.Id, userId);

        // Assert
        var updatedEvent = await _eventService.GetEventByIdAsync(createdEvent.Id);
        Assert.NotNull(updatedEvent);
        Assert.Equal(1, updatedEvent!.RegisteredCount);
    }

    [Fact]
    public async Task RegisterForEventAsync_NonExistingEvent_ThrowsKeyNotFoundException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _eventService.RegisterForEventAsync(Guid.NewGuid(), "test-user"));
    }

    [Fact]
    public async Task RegisterForEventAsync_EventAtCapacity_ThrowsInvalidOperationException()
    {
        // Arrange
        var createDto = new CreateEventDto(
            "Full Event",
            "Already at capacity",
            DateTimeOffset.Now.AddDays(30),
            1
        );
        var createdEvent = await _eventService.CreateEventAsync(createDto);

        // Fill the event
        await _eventService.RegisterForEventAsync(createdEvent.Id, "user1");

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _eventService.RegisterForEventAsync(createdEvent.Id, "user2"));
    }

    [Fact]
    public async Task RegisterForEventAsync_PastEvent_ThrowsInvalidOperationException()
    {
        // Arrange
        var createDto = new CreateEventDto(
            "Past Event",
            "Already happened",
            DateTimeOffset.Now.AddDays(-1), // Past date
            10
        );
        var createdEvent = await _eventService.CreateEventAsync(createDto);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _eventService.RegisterForEventAsync(createdEvent.Id, "test-user"));
    }

    [Fact]
    public async Task RegisterForEventAsync_DuplicateRegistration_ThrowsInvalidOperationException()
    {
        // Arrange
        var createDto = new CreateEventDto(
            "Duplicate Registration Test",
            "Testing duplicate registration",
            DateTimeOffset.Now.AddDays(30),
            10
        );
        var createdEvent = await _eventService.CreateEventAsync(createDto);
        var userId = "test-user-123";

        // Register once
        await _eventService.RegisterForEventAsync(createdEvent.Id, userId);

        // Try to register again
        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _eventService.RegisterForEventAsync(createdEvent.Id, userId));
    }

    [Fact]
    public async Task UnregisterFromEventAsync_ValidUnregistration_UnregistersUser()
    {
        // Arrange
        var createDto = new CreateEventDto(
            "Unregistration Test Event",
            "For testing unregistration",
            DateTimeOffset.Now.AddDays(30),
            10
        );
        var createdEvent = await _eventService.CreateEventAsync(createDto);
        var userId = "test-user-123";

        // Register first
        await _eventService.RegisterForEventAsync(createdEvent.Id, userId);

        // Act
        await _eventService.UnregisterFromEventAsync(createdEvent.Id, userId);

        // Assert
        var updatedEvent = await _eventService.GetEventByIdAsync(createdEvent.Id);
        Assert.NotNull(updatedEvent);
        Assert.Equal(0, updatedEvent!.RegisteredCount);
    }

    [Fact]
    public async Task UnregisterFromEventAsync_NonExistingEvent_ThrowsKeyNotFoundException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _eventService.UnregisterFromEventAsync(Guid.NewGuid(), "test-user"));
    }

    [Fact]
    public async Task UnregisterFromEventAsync_UserNotRegistered_ThrowsInvalidOperationException()
    {
        // Arrange
        var createDto = new CreateEventDto(
            "Unregistration Test Event",
            "For testing unregistration",
            DateTimeOffset.Now.AddDays(30),
            10
        );
        var createdEvent = await _eventService.CreateEventAsync(createDto);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _eventService.UnregisterFromEventAsync(createdEvent.Id, "non-registered-user"));
    }
}
