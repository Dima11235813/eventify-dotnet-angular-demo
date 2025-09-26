using EventManagement.Domain;
using EventManagement.Infrastructure;
using Xunit;

namespace EventManagement.Tests;

public class InMemoryEventStoreTests
{
    private readonly IEventStore _eventStore;

    public InMemoryEventStoreTests()
    {
        _eventStore = new InMemoryEventStore();
    }

    [Fact]
    public async Task Constructor_SeedsWithMockData()
    {
        // Act
        var events = await _eventStore.GetAllAsync();

        // Assert
        Assert.NotNull(events);
        Assert.True(events.Any()); // Should have seeded data from EventCatalog

        // Verify some known events exist
        var eventList = events.ToList();
        Assert.Contains(eventList, e => e.Title.Contains("Microsoft Build"));
        Assert.Contains(eventList, e => e.Title.Contains("AWS re:Invent"));
    }

    [Fact]
    public async Task GetByIdAsync_ExistingEvent_ReturnsEvent()
    {
        // Arrange
        var events = await _eventStore.GetAllAsync();
        var firstEvent = events.First();

        // Act
        var result = await _eventStore.GetByIdAsync(firstEvent.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(firstEvent.Id, result!.Id);
        Assert.Equal(firstEvent.Title, result.Title);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingEvent_ReturnsNull()
    {
        // Act
        var result = await _eventStore.GetByIdAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllEvents()
    {
        // Act
        var events = await _eventStore.GetAllAsync();

        // Assert
        Assert.NotNull(events);
        Assert.True(events.Any());
        Assert.All(events, e => Assert.NotNull(e.Title));
    }

    [Fact]
    public async Task AddAsync_NewEvent_AddsEvent()
    {
        // Arrange
        var newEvent = new Event(
            Guid.NewGuid(),
            "New Test Event",
            "Test Description",
            DateTimeOffset.Now.AddDays(30),
            100
        );

        // Act
        await _eventStore.AddAsync(newEvent);

        // Assert
        var retrieved = await _eventStore.GetByIdAsync(newEvent.Id);
        Assert.NotNull(retrieved);
        Assert.Equal(newEvent.Id, retrieved!.Id);
        Assert.Equal(newEvent.Title, retrieved.Title);
    }

    [Fact]
    public async Task AddAsync_DuplicateEvent_ThrowsInvalidOperationException()
    {
        // Arrange
        var events = await _eventStore.GetAllAsync();
        var firstEvent = events.First();

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _eventStore.AddAsync(firstEvent));
    }

    [Fact]
    public async Task UpdateAsync_ExistingEvent_UpdatesEvent()
    {
        // Arrange
        var newEvent = new Event(
            Guid.NewGuid(),
            "Event to Update",
            "Original Description",
            DateTimeOffset.Now.AddDays(30),
            50
        );
        await _eventStore.AddAsync(newEvent);

        var updatedEvent = new Event(
            newEvent.Id,
            "Updated Event",
            "Updated Description",
            newEvent.Date.AddDays(5),
            75
        );

        // Act
        await _eventStore.UpdateAsync(updatedEvent);

        // Assert
        var retrieved = await _eventStore.GetByIdAsync(newEvent.Id);
        Assert.NotNull(retrieved);
        Assert.Equal("Updated Event", retrieved!.Title);
        Assert.Equal("Updated Description", retrieved.Description);
        Assert.Equal(75, retrieved.MaxCapacity);
    }

    [Fact]
    public async Task UpdateAsync_NonExistingEvent_ThrowsInvalidOperationException()
    {
        // Arrange
        var nonExistingEvent = new Event(
            Guid.NewGuid(),
            "Non-existing Event",
            "Should not exist",
            DateTimeOffset.Now.AddDays(30),
            100
        );

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _eventStore.UpdateAsync(nonExistingEvent));
    }

    [Fact]
    public async Task DeleteAsync_ExistingEvent_DeletesEvent()
    {
        // Arrange
        var newEvent = new Event(
            Guid.NewGuid(),
            "Event to Delete",
            "Will be deleted",
            DateTimeOffset.Now.AddDays(30),
            50
        );
        await _eventStore.AddAsync(newEvent);

        // Act
        await _eventStore.DeleteAsync(newEvent.Id);

        // Assert
        var retrieved = await _eventStore.GetByIdAsync(newEvent.Id);
        Assert.Null(retrieved);
    }

    [Fact]
    public async Task DeleteAsync_NonExistingEvent_DoesNotThrow()
    {
        // Act - Should not throw
        await _eventStore.DeleteAsync(Guid.NewGuid());

        // Assert - No exception thrown
    }

    [Fact]
    public async Task ExistsAsync_ExistingEvent_ReturnsTrue()
    {
        // Arrange
        var events = await _eventStore.GetAllAsync();
        var firstEvent = events.First();

        // Act
        var exists = await _eventStore.ExistsAsync(firstEvent.Id);

        // Assert
        Assert.True(exists);
    }

    [Fact]
    public async Task ExistsAsync_NonExistingEvent_ReturnsFalse()
    {
        // Act
        var exists = await _eventStore.ExistsAsync(Guid.NewGuid());

        // Assert
        Assert.False(exists);
    }

    [Fact]
    public async Task ThreadSafety_MultipleConcurrentOperations_WorkCorrectly()
    {
        // Arrange
        var tasks = new List<Task>();
        var results = new List<Event>();

        // Act - Perform multiple concurrent operations
        for (int i = 0; i < 10; i++)
        {
            var taskId = i;
            tasks.Add(Task.Run(async () =>
            {
                var newEvent = new Event(
                    Guid.NewGuid(),
                    $"Concurrent Event {taskId}",
                    $"Description {taskId}",
                    DateTimeOffset.Now.AddDays(30 + taskId),
                    100 + taskId
                );

                await _eventStore.AddAsync(newEvent);
                results.Add(newEvent);
            }));
        }

        await Task.WhenAll(tasks);

        // Assert
        Assert.Equal(10, results.Count);
        foreach (var result in results)
        {
            var retrieved = await _eventStore.GetByIdAsync(result.Id);
            Assert.NotNull(retrieved);
            Assert.Equal(result.Title, retrieved!.Title);
        }
    }
}
