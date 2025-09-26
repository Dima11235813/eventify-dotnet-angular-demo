# EventManagement API

A .NET 9 Web API for managing events with CRUD operations and user registration functionality.

## Architecture

The project follows Clean Architecture principles with the following layers:

- **Domain**: Core business entities and interfaces
- **Application**: Business logic and DTOs
- **Infrastructure**: Data access implementations
- **Presentation**: ASP.NET Core Web API controllers

## Getting Started

### Prerequisites

- .NET 9.0 SDK
- An IDE (Visual Studio, VS Code, Rider, etc.)

### Running the API

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Build the solution:
   ```bash
   dotnet build
   ```

4. Run the API:
   ```bash
   dotnet run --project src/Presentation/EventManagement.Presentation.csproj
   ```

The API will start on `https://localhost:5001` (or the port configured in `launchSettings.json`).

### API Endpoints

- `GET /events` - Get all events
- `GET /events/{id}` - Get event by ID
- `POST /events` - Create a new event
- `PUT /events/{id}` - Update an existing event
- `POST /events/{id}/register` - Register for an event
- `DELETE /events/{id}/register` - Unregister from an event

## Testing

### Unit Tests

The project includes comprehensive unit tests for all layers.

#### Running Unit Tests

To run all unit tests:

```bash
# From the api directory
dotnet test
```

To run tests with detailed output:

```bash
dotnet test --verbosity normal
```

To run tests for a specific project:

```bash
dotnet test EventManagement.Tests/EventManagement.Tests.csproj
```

To run tests in watch mode (automatically re-runs when files change):

```bash
dotnet watch test
```

#### Test Coverage

The test suite covers:

- **EventService**: All CRUD operations, registration logic, error handling
- **InMemoryEventStore**: Data persistence, thread safety, seeding with mock data
- **Error scenarios**: Invalid operations, not found cases, validation failures

### Test Structure

```
EventManagement.Tests/
├── EventServiceTests.cs      # Tests for business logic layer
└── InMemoryEventStoreTests.cs # Tests for data access layer
```

### Mock Data

The API is seeded with mock event data from `EventCatalog.cs` including major tech conferences like:

- Microsoft Build, Ignite
- .NET Conf
- AWS re:Invent, Summit events
- Google I/O
- NVIDIA GTC
- And many more...

## Development

### Project Structure

```
api/
├── EventManagement.sln
├── src/
│   ├── Domain/
│   │   ├── Event.cs              # Domain entity
│   │   ├── EventCatalog.cs       # Mock data
│   │   ├── IEvent.cs             # Domain interface
│   │   └── Registration.cs       # Registration entity
│   ├── Application/
│   │   ├── Dtos/
│   │   │   ├── EventDto.cs
│   │   │   ├── CreateEventDto.cs
│   │   │   └── UpdateEventDto.cs
│   │   ├── EventService.cs       # Business logic
│   │   └── IEventService.cs      # Service interface
│   ├── Infrastructure/
│   │   ├── IEventStore.cs        # Repository interface
│   │   └── InMemoryEventStore.cs # In-memory repository
│   └── Presentation/
│       ├── Controllers/
│       │   └── EventsController.cs
│       ├── Program.cs            # Application entry point
│       └── appsettings.json
└── tests/
    └── EventManagement.Tests/     # Unit tests
```

### Building and Running Tests in CI/CD

For automated testing in CI/CD pipelines:

```bash
# Build all projects
dotnet build EventManagement.sln

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run tests and generate test results
dotnet test --logger "trx;LogFileName=test-results.trx"
```
