using EventManagement.Infrastructure;
using FluentAssertions;
using Xunit;

namespace EventManagement.Tests;

public class InMemoryUserRegistrationStoreTests
{
    private readonly IUserRegistrationStore _store;

    public InMemoryUserRegistrationStoreTests()
    {
        _store = new InMemoryUserRegistrationStore();
    }

    [Fact]
    public async Task IsRegisteredAsync_NewUser_ReturnsFalse()
    {
        // Arrange
        var userId = "new-user";
        var eventId = Guid.NewGuid();

        // Act
        var result = await _store.IsRegisteredAsync(userId, eventId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsRegisteredAsync_RegisteredUser_ReturnsTrue()
    {
        // Arrange
        var userId = "registered-user";
        var eventId = Guid.NewGuid();
        await _store.RegisterAsync(userId, eventId);

        // Act
        var result = await _store.IsRegisteredAsync(userId, eventId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsRegisteredAsync_DifferentEvent_ReturnsFalse()
    {
        // Arrange
        var userId = "user";
        var eventId1 = Guid.NewGuid();
        var eventId2 = Guid.NewGuid();
        await _store.RegisterAsync(userId, eventId1);

        // Act
        var result = await _store.IsRegisteredAsync(userId, eventId2);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsRegisteredAsync_DifferentUser_ReturnsFalse()
    {
        // Arrange
        var userId1 = "user1";
        var userId2 = "user2";
        var eventId = Guid.NewGuid();
        await _store.RegisterAsync(userId1, eventId);

        // Act
        var result = await _store.IsRegisteredAsync(userId2, eventId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RegisterAsync_NewUser_AddsRegistration()
    {
        // Arrange
        var userId = "new-user";
        var eventId = Guid.NewGuid();

        // Act
        await _store.RegisterAsync(userId, eventId);

        // Assert
        var isRegistered = await _store.IsRegisteredAsync(userId, eventId);
        isRegistered.Should().BeTrue();
    }

    [Fact]
    public async Task RegisterAsync_ExistingUser_AddsAnotherEvent()
    {
        // Arrange
        var userId = "existing-user";
        var eventId1 = Guid.NewGuid();
        var eventId2 = Guid.NewGuid();
        await _store.RegisterAsync(userId, eventId1);

        // Act
        await _store.RegisterAsync(userId, eventId2);

        // Assert
        var isRegistered1 = await _store.IsRegisteredAsync(userId, eventId1);
        var isRegistered2 = await _store.IsRegisteredAsync(userId, eventId2);
        isRegistered1.Should().BeTrue();
        isRegistered2.Should().BeTrue();
    }

    [Fact]
    public async Task RegisterAsync_DuplicateRegistration_DoesNotThrow()
    {
        // Arrange
        var userId = "user";
        var eventId = Guid.NewGuid();
        await _store.RegisterAsync(userId, eventId);

        // Act - Should not throw
        await _store.RegisterAsync(userId, eventId);

        // Assert - Still registered
        var isRegistered = await _store.IsRegisteredAsync(userId, eventId);
        isRegistered.Should().BeTrue();
    }

    [Fact]
    public async Task UnregisterAsync_RegisteredUser_RemovesRegistration()
    {
        // Arrange
        var userId = "registered-user";
        var eventId = Guid.NewGuid();
        await _store.RegisterAsync(userId, eventId);

        // Act
        await _store.UnregisterAsync(userId, eventId);

        // Assert
        var isRegistered = await _store.IsRegisteredAsync(userId, eventId);
        isRegistered.Should().BeFalse();
    }

    [Fact]
    public async Task UnregisterAsync_UnregisteredUser_DoesNotThrow()
    {
        // Arrange
        var userId = "unregistered-user";
        var eventId = Guid.NewGuid();

        // Act - Should not throw
        await _store.UnregisterAsync(userId, eventId);

        // Assert
        var isRegistered = await _store.IsRegisteredAsync(userId, eventId);
        isRegistered.Should().BeFalse();
    }

    [Fact]
    public async Task UnregisterAsync_DifferentEvent_LeavesOtherRegistrationIntact()
    {
        // Arrange
        var userId = "user";
        var eventId1 = Guid.NewGuid();
        var eventId2 = Guid.NewGuid();
        await _store.RegisterAsync(userId, eventId1);
        await _store.RegisterAsync(userId, eventId2);

        // Act
        await _store.UnregisterAsync(userId, eventId1);

        // Assert
        var isRegistered1 = await _store.IsRegisteredAsync(userId, eventId1);
        var isRegistered2 = await _store.IsRegisteredAsync(userId, eventId2);
        isRegistered1.Should().BeFalse();
        isRegistered2.Should().BeTrue();
    }

    [Fact]
    public async Task GetRegistrationsAsync_UserWithRegistrations_ReturnsEventIds()
    {
        // Arrange
        var userId = "user-with-registrations";
        var eventId1 = Guid.NewGuid();
        var eventId2 = Guid.NewGuid();
        var eventId3 = Guid.NewGuid();
        await _store.RegisterAsync(userId, eventId1);
        await _store.RegisterAsync(userId, eventId2);
        await _store.RegisterAsync(userId, eventId3);

        // Act
        var registrations = await _store.GetRegistrationsAsync(userId);

        // Assert
        registrations.Should().HaveCount(3);
        registrations.Should().Contain(eventId1);
        registrations.Should().Contain(eventId2);
        registrations.Should().Contain(eventId3);
    }

    [Fact]
    public async Task GetRegistrationsAsync_UserWithoutRegistrations_ReturnsEmptyCollection()
    {
        // Arrange
        var userId = "user-without-registrations";

        // Act
        var registrations = await _store.GetRegistrationsAsync(userId);

        // Assert
        registrations.Should().BeEmpty();
    }

    [Fact]
    public async Task GetRegistrationsAsync_UserWithUnregistrations_ReturnsRemainingEvents()
    {
        // Arrange
        var userId = "user";
        var eventId1 = Guid.NewGuid();
        var eventId2 = Guid.NewGuid();
        var eventId3 = Guid.NewGuid();
        await _store.RegisterAsync(userId, eventId1);
        await _store.RegisterAsync(userId, eventId2);
        await _store.RegisterAsync(userId, eventId3);
        await _store.UnregisterAsync(userId, eventId2);

        // Act
        var registrations = await _store.GetRegistrationsAsync(userId);

        // Assert
        registrations.Should().HaveCount(2);
        registrations.Should().Contain(eventId1);
        registrations.Should().Contain(eventId3);
        registrations.Should().NotContain(eventId2);
    }

    [Fact]
    public async Task ThreadSafety_MultipleConcurrentOperations_WorkCorrectly()
    {
        // Arrange
        var tasks = new List<Task>();
        var userIds = new List<string>();
        var eventIds = new List<Guid>();

        // Create test data
        for (int i = 0; i < 10; i++)
        {
            userIds.Add($"concurrent-user-{i}");
            eventIds.Add(Guid.NewGuid());
        }

        // Act - Perform concurrent operations
        for (int i = 0; i < 10; i++)
        {
            var index = i;
            tasks.Add(Task.Run(async () =>
            {
                var userId = userIds[index];
                var eventId = eventIds[index];

                // Register
                await _store.RegisterAsync(userId, eventId);

                // Check registration
                var isRegistered = await _store.IsRegisteredAsync(userId, eventId);
                Assert.True(isRegistered);

                // Get registrations
                var registrations = await _store.GetRegistrationsAsync(userId);
                Assert.Contains(eventId, registrations);

                // Unregister
                await _store.UnregisterAsync(userId, eventId);

                // Check unregistration
                var isStillRegistered = await _store.IsRegisteredAsync(userId, eventId);
                Assert.False(isStillRegistered);
            }));
        }

        await Task.WhenAll(tasks);

        // Assert - All operations completed without exceptions
        // If we get here, thread safety worked
    }

    [Fact]
    public async Task ComplexScenario_MultipleUsersMultipleEvents_WorksCorrectly()
    {
        // Arrange
        var users = new[] { "alice", "bob", "charlie" };
        var events = new[] { Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid() };

        // Alice registers for all events
        await _store.RegisterAsync(users[0], events[0]);
        await _store.RegisterAsync(users[0], events[1]);
        await _store.RegisterAsync(users[0], events[2]);

        // Bob registers for first two events
        await _store.RegisterAsync(users[1], events[0]);
        await _store.RegisterAsync(users[1], events[1]);

        // Charlie registers for last event
        await _store.RegisterAsync(users[2], events[2]);

        // Act & Assert
        // Check Alice's registrations
        var aliceRegs = await _store.GetRegistrationsAsync(users[0]);
        aliceRegs.Should().HaveCount(3);
        aliceRegs.Should().Contain(events[0]);
        aliceRegs.Should().Contain(events[1]);
        aliceRegs.Should().Contain(events[2]);

        // Check Bob's registrations
        var bobRegs = await _store.GetRegistrationsAsync(users[1]);
        bobRegs.Should().HaveCount(2);
        bobRegs.Should().Contain(events[0]);
        bobRegs.Should().Contain(events[1]);
        bobRegs.Should().NotContain(events[2]);

        // Check Charlie's registrations
        var charlieRegs = await _store.GetRegistrationsAsync(users[2]);
        charlieRegs.Should().HaveCount(1);
        charlieRegs.Should().Contain(events[2]);

        // Check specific registrations
        (await _store.IsRegisteredAsync(users[0], events[0])).Should().BeTrue();
        (await _store.IsRegisteredAsync(users[0], events[1])).Should().BeTrue();
        (await _store.IsRegisteredAsync(users[0], events[2])).Should().BeTrue();
        (await _store.IsRegisteredAsync(users[1], events[0])).Should().BeTrue();
        (await _store.IsRegisteredAsync(users[1], events[1])).Should().BeTrue();
        (await _store.IsRegisteredAsync(users[1], events[2])).Should().BeFalse();
        (await _store.IsRegisteredAsync(users[2], events[2])).Should().BeTrue();
    }
}
