using EventManagement.Application.Dtos;
using FluentAssertions;
using Xunit;

namespace EventManagement.Tests;

public class DtoSerializationTests
{
    [Fact]
    public void RegistrationDto_CreatesWithValidData()
    {
        // Arrange & Act
        var dto = new RegistrationDto(Guid.NewGuid(), "test-user-123");

        // Assert
        dto.EventId.Should().NotBeEmpty();
        dto.UserId.Should().Be("test-user-123");
    }

    [Fact]
    public void RegistrationDto_RecordsAreEqual_WhenSameValues()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var userId = "test-user-123";

        // Act
        var dto1 = new RegistrationDto(eventId, userId);
        var dto2 = new RegistrationDto(eventId, userId);

        // Assert
        dto1.Should().BeEquivalentTo(dto2);
    }

    [Fact]
    public void RegistrationDto_RecordsAreNotEqual_WhenDifferentValues()
    {
        // Arrange & Act
        var dto1 = new RegistrationDto(Guid.NewGuid(), "user1");
        var dto2 = new RegistrationDto(Guid.NewGuid(), "user2");

        // Assert
        dto1.Should().NotBeEquivalentTo(dto2);
    }

    [Fact]
    public void UpdateEventDto_CreatesWithValidData()
    {
        // Arrange
        var title = "Updated Event Title";
        var description = "Updated description";
        var date = DateTimeOffset.Now.AddDays(7);
        var maxCapacity = 150;

        // Act
        var dto = new UpdateEventDto(title, description, date, maxCapacity);

        // Assert
        dto.Title.Should().Be(title);
        dto.Description.Should().Be(description);
        dto.Date.Should().Be(date);
        dto.MaxCapacity.Should().Be(maxCapacity);
    }

    [Fact]
    public void UpdateEventDto_CreatesWithNullDescription()
    {
        // Arrange
        var title = "Updated Event Title";
        var date = DateTimeOffset.Now.AddDays(7);
        var maxCapacity = 150;

        // Act
        var dto = new UpdateEventDto(title, null, date, maxCapacity);

        // Assert
        dto.Title.Should().Be(title);
        dto.Description.Should().BeNull();
        dto.Date.Should().Be(date);
        dto.MaxCapacity.Should().Be(maxCapacity);
    }

    [Fact]
    public void UpdateEventDto_RecordsAreEqual_WhenSameValues()
    {
        // Arrange
        var title = "Updated Event Title";
        var description = "Updated description";
        var date = DateTimeOffset.Now.AddDays(7);
        var maxCapacity = 150;

        // Act
        var dto1 = new UpdateEventDto(title, description, date, maxCapacity);
        var dto2 = new UpdateEventDto(title, description, date, maxCapacity);

        // Assert
        dto1.Should().BeEquivalentTo(dto2);
    }

    [Fact]
    public void UpdateEventDto_RecordsAreNotEqual_WhenDifferentValues()
    {
        // Arrange
        var dto1 = new UpdateEventDto("Title1", "Desc1", DateTimeOffset.Now.AddDays(7), 100);
        var dto2 = new UpdateEventDto("Title2", "Desc2", DateTimeOffset.Now.AddDays(14), 200);

        // Assert
        dto1.Should().NotBeEquivalentTo(dto2);
    }

    [Fact]
    public void UserDto_CreatesWithValidData()
    {
        // Arrange
        var id = "user-123";
        var name = "John Doe";
        var email = "john.doe@example.com";

        // Act
        var dto = new UserDto(id, name, email);

        // Assert
        dto.Id.Should().Be(id);
        dto.Name.Should().Be(name);
        dto.Email.Should().Be(email);
    }

    [Fact]
    public void UserDto_RecordsAreEqual_WhenSameValues()
    {
        // Arrange
        var id = "user-123";
        var name = "John Doe";
        var email = "john.doe@example.com";

        // Act
        var dto1 = new UserDto(id, name, email);
        var dto2 = new UserDto(id, name, email);

        // Assert
        dto1.Should().BeEquivalentTo(dto2);
    }

    [Fact]
    public void UserDto_RecordsAreNotEqual_WhenDifferentValues()
    {
        // Arrange
        var dto1 = new UserDto("user1", "John", "john@example.com");
        var dto2 = new UserDto("user2", "Jane", "jane@example.com");

        // Assert
        dto1.Should().NotBeEquivalentTo(dto2);
    }

    [Fact]
    public void EventMetaDataDto_CreatesWithDefaultValues()
    {
        // Act
        var dto = new EventMetaDataDto();

        // Assert
        dto.EventId.Should().BeEmpty();
        dto.Title.Should().BeEmpty();
        dto.Description.Should().BeEmpty();
        dto.Organizer.Should().BeEmpty();
        dto.Location.Should().BeEmpty();
        dto.StartDate.Should().Be(default);
        dto.EndDate.Should().Be(default);
        dto.AttendeeCount.Should().Be(0);
        dto.Capacity.Should().Be(0);
        dto.IsOnline.Should().BeFalse();
        dto.EventUrl.Should().BeEmpty();
        dto.Tags.Should().NotBeNull();
        dto.Tags.Should().BeEmpty();
        dto.Category.Should().BeEmpty();
        dto.ImageUrl.Should().BeEmpty();
        dto.Price.Should().BeNull();
        dto.Currency.Should().BeEmpty();
        dto.IsFree.Should().BeTrue(); // Because Price is null
        dto.CreatedAt.Should().Be(default);
        dto.UpdatedAt.Should().Be(default);
        dto.Status.Should().BeEmpty();
    }

    [Fact]
    public void EventMetaDataDto_IsFree_ReturnsTrue_WhenPriceIsNull()
    {
        // Arrange
        var dto = new EventMetaDataDto
        {
            Price = null
        };

        // Act & Assert
        dto.IsFree.Should().BeTrue();
    }

    [Fact]
    public void EventMetaDataDto_IsFree_ReturnsTrue_WhenPriceIsZero()
    {
        // Arrange
        var dto = new EventMetaDataDto
        {
            Price = 0
        };

        // Act & Assert
        dto.IsFree.Should().BeTrue();
    }

    [Fact]
    public void EventMetaDataDto_IsFree_ReturnsFalse_WhenPriceIsGreaterThanZero()
    {
        // Arrange
        var dto = new EventMetaDataDto
        {
            Price = 29.99m
        };

        // Act & Assert
        dto.IsFree.Should().BeFalse();
    }

    [Fact]
    public void EventMetaDataDto_CreatesWithCompleteData()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var startDate = DateTimeOffset.Now.AddDays(7);
        var endDate = startDate.AddHours(2);
        var tags = new List<string> { "tech", "webinar", "free" };

        // Act
        var dto = new EventMetaDataDto
        {
            EventId = eventId,
            Title = "Tech Webinar 2025",
            Description = "Learn about the latest in technology",
            Organizer = "Tech Corp",
            Location = "Online",
            StartDate = startDate,
            EndDate = endDate,
            AttendeeCount = 45,
            Capacity = 100,
            IsOnline = true,
            EventUrl = "https://example.com/events/tech-webinar",
            Tags = tags,
            Category = "Technology",
            ImageUrl = "https://example.com/images/webinar.jpg",
            Price = 0,
            Currency = "USD",
            CreatedAt = DateTimeOffset.Now.AddDays(-3),
            UpdatedAt = DateTimeOffset.Now,
            Status = "Upcoming"
        };

        // Assert
        dto.EventId.Should().Be(eventId);
        dto.Title.Should().Be("Tech Webinar 2025");
        dto.Description.Should().Be("Learn about the latest in technology");
        dto.Organizer.Should().Be("Tech Corp");
        dto.Location.Should().Be("Online");
        dto.StartDate.Should().Be(startDate);
        dto.EndDate.Should().Be(endDate);
        dto.AttendeeCount.Should().Be(45);
        dto.Capacity.Should().Be(100);
        dto.IsOnline.Should().BeTrue();
        dto.EventUrl.Should().Be("https://example.com/events/tech-webinar");
        dto.Tags.Should().BeEquivalentTo(tags);
        dto.Category.Should().Be("Technology");
        dto.ImageUrl.Should().Be("https://example.com/images/webinar.jpg");
        dto.Price.Should().Be(0);
        dto.Currency.Should().Be("USD");
        dto.IsFree.Should().BeTrue();
        dto.Status.Should().Be("Upcoming");
    }

    [Fact]
    public void EventMetaDataDto_TagsCollection_IsInitializedInConstructor()
    {
        // Act
        var dto = new EventMetaDataDto();

        // Assert
        dto.Tags.Should().NotBeNull();
        dto.Tags.Should().BeEmpty();
    }

    [Fact]
    public void EventMetaDataDto_TagsCollection_CanBeModified()
    {
        // Arrange
        var dto = new EventMetaDataDto();

        // Act
        dto.Tags.Add("tech");
        dto.Tags.Add("webinar");

        // Assert
        dto.Tags.Should().HaveCount(2);
        dto.Tags.Should().Contain("tech");
        dto.Tags.Should().Contain("webinar");
    }
}
