## Event Domain

- `Event` enforces business rules:
  - Cannot register for past events (compares against `DateTimeOffset.UtcNow`)
  - Cannot exceed event capacity (`RegisteredCount < MaxCapacity`)
  - Cannot double-register the same user for the same event

- `Registration` captures `EventId` and `UserId`.

Dates from the backend are stored as UTC (`DateTimeOffset`) and should be rendered in the user's local time by the frontend.