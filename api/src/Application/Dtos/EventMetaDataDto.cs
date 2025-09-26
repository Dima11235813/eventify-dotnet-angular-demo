using System;
using System.Collections.Generic;

namespace EventManagement.Application.Dtos
{
    public class EventMetaDataDto
    {
        public Guid EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Organizer { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public int AttendeeCount { get; set; }
        public int Capacity { get; set; }
        public bool IsOnline { get; set; }
        public string EventUrl { get; set; } = string.Empty;
        public List<string> Tags { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public decimal? Price { get; set; }
        public string Currency { get; set; } = string.Empty;
        public bool IsFree => !Price.HasValue || Price == 0;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public string Status { get; set; } = string.Empty; // e.g. Upcoming, Ongoing, Completed, Cancelled

        public EventMetaDataDto()
        {
            Tags = new List<string>();
        }
    }
}