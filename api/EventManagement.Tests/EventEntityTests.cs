using EventManagement.Domain;
using FluentAssertions;
using Xunit;

namespace EventManagement.Tests;

public class EventEntityTests
{
    [Fact]
    public void Constructor_CreatesEventWithValidData()
    {
        // Arrange
        var id = Guid.NewGuid();
        var title = "Test Event";
        var description = "Test Description";
        var date = DateTimeOffset.Now.AddDays(7);
        var maxCapacity = 100;

        // Act
        var @event = new Event(id, title, description, date, maxCapacity);

        // Assert
        @event.Id.Should().Be(id);
        @event.Title.Should().Be(title);
        @event.Description.Should().Be(description);
        @event.Date.Should().Be(date);
        @event.MaxCapacity.Should().Be(maxCapacity);
        @event.RegisteredCount.Should().Be(0);
        @event.Registrations.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithNullDescription_CreatesEvent()
    {
        // Arrange
        var id = Guid.NewGuid();
        var title = "Test Event";
        var date = DateTimeOffset.Now.AddDays(7);
        var maxCapacity = 100;

        // Act
        var @event = new Event(id, title, null, date, maxCapacity);

        // Assert
        @event.Id.Should().Be(id);
        @event.Title.Should().Be(title);
        @event.Description.Should().BeNull();
        @event.Date.Should().Be(date);
        @event.MaxCapacity.Should().Be(maxCapacity);
        @event.RegisteredCount.Should().Be(0);
        @event.Registrations.Should().BeEmpty();
    }

    [Fact]
    public void Update_ChangesAllProperties()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Original Title",
            "Original Description",
            DateTimeOffset.Now.AddDays(7),
            50
        );

        var newTitle = "Updated Title";
        var newDescription = "Updated Description";
        var newDate = DateTimeOffset.Now.AddDays(14);
        var newMaxCapacity = 75;

        // Act
        @event.Update(newTitle, newDescription, newDate, newMaxCapacity);

        // Assert
        @event.Title.Should().Be(newTitle);
        @event.Description.Should().Be(newDescription);
        @event.Date.Should().Be(newDate);
        @event.MaxCapacity.Should().Be(newMaxCapacity);
    }

    [Fact]
    public void Update_WithNullDescription_SetsDescriptionToNull()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Original Title",
            "Original Description",
            DateTimeOffset.Now.AddDays(7),
            50
        );

        // Act
        @event.Update("Updated Title", null, DateTimeOffset.Now.AddDays(14), 75);

        // Assert
        @event.Title.Should().Be("Updated Title");
        @event.Description.Should().BeNull();
    }

    [Fact]
    public void CanRegister_FutureEventWithCapacity_ReturnsTrue()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Future Event",
            "Available for registration",
            DateTimeOffset.Now.AddDays(1), // Future date
            10
        );

        // Act
        var canRegister = @event.CanRegister();

        // Assert
        canRegister.Should().BeTrue();
    }

    [Fact]
    public void CanRegister_PastEvent_ReturnsFalse()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Past Event",
            "No longer available",
            DateTimeOffset.Now.AddDays(-1), // Past date
            10
        );

        // Act
        var canRegister = @event.CanRegister();

        // Assert
        canRegister.Should().BeFalse();
    }

    [Fact]
    public void CanRegister_EventAtCapacity_ReturnsFalse()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Full Event",
            "At capacity",
            DateTimeOffset.Now.AddDays(1),
            1 // Capacity of 1
        );

        // Register one user to fill capacity
        @event.RegisterUser("user1");

        // Act
        var canRegister = @event.CanRegister();

        // Assert
        canRegister.Should().BeFalse();
    }

    [Fact]
    public void CanRegister_EventWithZeroCapacity_ReturnsFalse()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "No Capacity Event",
            "No spots available",
            DateTimeOffset.Now.AddDays(1),
            0 // Zero capacity
        );

        // Act
        var canRegister = @event.CanRegister();

        // Assert
        canRegister.Should().BeFalse();
    }

    [Fact]
    public void IsUserRegistered_NewUser_ReturnsFalse()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Test Event",
            "For registration testing",
            DateTimeOffset.Now.AddDays(1),
            10
        );

        // Act
        var isRegistered = @event.IsUserRegistered("new-user");

        // Assert
        isRegistered.Should().BeFalse();
    }

    [Fact]
    public void IsUserRegistered_RegisteredUser_ReturnsTrue()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Test Event",
            "For registration testing",
            DateTimeOffset.Now.AddDays(1),
            10
        );
        var userId = "registered-user";
        @event.RegisterUser(userId);

        // Act
        var isRegistered = @event.IsUserRegistered(userId);

        // Assert
        isRegistered.Should().BeTrue();
    }

    [Fact]
    public void RegisterUser_ValidRegistration_AddsUserToRegistrations()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Test Event",
            "For registration testing",
            DateTimeOffset.Now.AddDays(1),
            10
        );
        var userId = "test-user";

        // Act
        @event.RegisterUser(userId);

        // Assert
        @event.RegisteredCount.Should().Be(1);
        @event.Registrations.Should().HaveCount(1);
        @event.Registrations.First().UserId.Should().Be(userId);
        @event.Registrations.First().EventId.Should().Be(@event.Id);
        @event.IsUserRegistered(userId).Should().BeTrue();
    }

    [Fact]
    public void RegisterUser_DuplicateRegistration_ThrowsInvalidOperationException()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Test Event",
            "For registration testing",
            DateTimeOffset.Now.AddDays(1),
            10
        );
        var userId = "duplicate-user";
        @event.RegisterUser(userId); // First registration

        // Act & Assert
        var action = () => @event.RegisterUser(userId);
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("User is already registered for this event");
    }

    [Fact]
    public void RegisterUser_EventAtCapacity_ThrowsInvalidOperationException()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Full Event",
            "At capacity",
            DateTimeOffset.Now.AddDays(1),
            1
        );
        @event.RegisterUser("user1"); // Fill capacity

        // Act & Assert
        var action = () => @event.RegisterUser("user2");
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot register for this event");
    }

    [Fact]
    public void RegisterUser_PastEvent_ThrowsInvalidOperationException()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Past Event",
            "Already happened",
            DateTimeOffset.Now.AddDays(-1), // Past event
            10
        );

        // Act & Assert
        var action = () => @event.RegisterUser("user1");
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot register for this event");
    }

    [Fact]
    public void UnregisterUser_RegisteredUser_RemovesUserFromRegistrations()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Test Event",
            "For unregistration testing",
            DateTimeOffset.Now.AddDays(1),
            10
        );
        var userId = "test-user";
        @event.RegisterUser(userId);

        // Act
        @event.UnregisterUser(userId);

        // Assert
        @event.RegisteredCount.Should().Be(0);
        @event.Registrations.Should().BeEmpty();
        @event.IsUserRegistered(userId).Should().BeFalse();
    }

    [Fact]
    public void UnregisterUser_UnregisteredUser_ThrowsInvalidOperationException()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Test Event",
            "For unregistration testing",
            DateTimeOffset.Now.AddDays(1),
            10
        );

        // Act & Assert
        var action = () => @event.UnregisterUser("non-registered-user");
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("User is not registered for this event");
    }

    [Fact]
    public void RegisteredCount_IncreasesWithRegistrations()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Test Event",
            "For count testing",
            DateTimeOffset.Now.AddDays(1),
            10
        );

        // Act & Assert
        @event.RegisteredCount.Should().Be(0);

        @event.RegisterUser("user1");
        @event.RegisteredCount.Should().Be(1);

        @event.RegisterUser("user2");
        @event.RegisteredCount.Should().Be(2);
    }

    [Fact]
    public void RegisteredCount_DecreasesWithUnregistrations()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Test Event",
            "For count testing",
            DateTimeOffset.Now.AddDays(1),
            10
        );
        @event.RegisterUser("user1");
        @event.RegisterUser("user2");

        // Act & Assert
        @event.RegisteredCount.Should().Be(2);

        @event.UnregisterUser("user1");
        @event.RegisteredCount.Should().Be(1);

        @event.UnregisterUser("user2");
        @event.RegisteredCount.Should().Be(0);
    }

    [Fact]
    public void Registrations_ReadOnlyCollection_CannotBeModifiedExternally()
    {
        // Arrange
        var @event = new Event(
            Guid.NewGuid(),
            "Test Event",
            "For collection testing",
            DateTimeOffset.Now.AddDays(1),
            10
        );

        // Act & Assert
        var registrations = @event.Registrations;

        // Should not be able to add directly to the collection
        var addAction = () => ((ICollection<Registration>)registrations).Add(new Registration(@event.Id, "external-user"));
        addAction.Should().Throw<NotSupportedException>();
    }
}
