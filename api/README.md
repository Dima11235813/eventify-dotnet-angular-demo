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

The API will start on:
- **HTTP**: `http://localhost:5146`
- **HTTPS**: `https://localhost:7013` (requires trust of self-signed certificate)

## HTTPS and Self-Signed Certificates

For local development with HTTPS, you need to trust the .NET development certificate:

### Windows (PowerShell as Administrator):
```powershell
dotnet dev-certs https --trust
```

### Linux/macOS:
```bash
dotnet dev-certs https --trust
```

If you encounter certificate errors in browsers, you may need to manually trust the certificate by visiting `https://localhost:7013` and accepting the security warning.

## CORS Configuration

The API is configured with CORS (Cross-Origin Resource Sharing) to allow requests from:

- **Angular Frontend**: `http://localhost:4200`
- **Swagger UI (HTTP)**: `http://localhost:5146`
- **Swagger UI (HTTPS)**: `https://localhost:7013`

CORS settings are configured in `appsettings.json` under the `Cors.AllowedOrigins` array. Add additional origins as needed for different development environments.

### API Endpoints

- `GET /events` - Get all events
- `GET /events/{id}` - Get event by ID
- `POST /events` - Create a new event
- `PUT /events/{id}` - Update an existing event
- `POST /events/{id}/register` - Register for an event
- `DELETE /events/{id}/register` - Unregister from an event

## cURL examples for registration rules

Ensure the API is running first. Base URL in these examples is `http://localhost:5146`.

1) List events and inspect capacity vs registrations

```bash
curl -s http://localhost:5146/events | jq '.[].{"id": .id, title: .title, date: .date, max: .maxCapacity, registered: .registeredCount}'
```

2) Attempt to register for a full event (expect HTTP 400)

```bash
# Replace EVENT_ID with an event where registeredCount == maxCapacity
curl -i -X POST http://localhost:5146/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user-123"}'
```

3) Attempt to register for a past event (expect HTTP 400)

```bash
# Replace EVENT_ID with an event whose date is in the past
curl -i -X POST http://localhost:5146/events/3d7e521f-8ed9-439b-8a1c-6276f668b2b0/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user-456"}'
```

4) Successful registration when there is capacity and the event is in the future (expect HTTP 200)

```bash
# Replace EVENT_ID with a future event where registeredCount < maxCapacity
curl -i -X POST http://localhost:5146/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user-123"}'
```

5) Unregister from an event (expect HTTP 200 if previously registered)

```bash
curl -i -X DELETE http://localhost:5146/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user-123"}'
```

Notes:
- The API returns 400 Bad Request with a helpful message when rules are violated (e.g., full event or past event).
- Use `GET /events?userId=demo-user-123` to see the `isRegistered` flag populated for that user.

## API Documentation

The API uses Swagger/OpenAPI for interactive documentation and testing.

### Accessing Swagger UI

When running in development mode, you can access the Swagger UI at:
- **HTTP**: `http://localhost:5146/swagger`
- **HTTPS**: `https://localhost:7013/swagger`

### OpenAPI Specification

The OpenAPI specification is available at:
- **JSON (HTTP)**: `http://localhost:5146/swagger/v1/swagger.json`
- **JSON (HTTPS)**: `https://localhost:7013/swagger/v1/swagger.json`
- **YAML (HTTP)**: `http://localhost:5146/swagger/v1/swagger.yaml`
- **YAML (HTTPS)**: `https://localhost:7013/swagger/v1/swagger.yaml`

### Using Swagger

1. Start the API using `dotnet run --project src/Presentation/EventManagement.Presentation.csproj`
2. Open your browser and navigate to `http://localhost:5146/swagger` or `https://localhost:7013/swagger`
3. You'll see all available endpoints with their parameters and response schemas
4. Click on any endpoint to expand it and see details
5. Click "Try it out" to test endpoints directly from the browser
6. Fill in required parameters and click "Execute" to send requests
7. View responses, including status codes and data

### Features

- **Interactive Testing**: Test API endpoints directly from the browser
- **Schema Documentation**: View detailed request/response schemas
- **Authentication**: (Future implementation)
- **API Versioning**: Current version v1

## Roadmap: EF Core persistence and relational schema

We will migrate from in-memory stores to EF Core with a relational schema to preserve domain rules via referential integrity:

- Tables:
  - `Users` (Id PK, Name, Email)
  - `Events` (Id PK, Title, Description, Date, MaxCapacity)
  - `Registrations` (EventId FK -> Events.Id, UserId FK -> Users.Id, CreatedAt)
- Keys and constraints:
  - Composite PK on (`EventId`,`UserId`) in `Registrations` to prevent duplicates
  - Foreign keys with cascade rules as appropriate
  - Unique index on (`EventId`,`UserId`)
- Relationships:
  - One `User` has many `Registrations`
  - One `Event` has many `Registrations`
  - Many-to-many between `Users` and `Events` through `Registrations`

Initial migration plan:
1. Introduce DbContext and entity configurations (Fluent API)
2. Add migrations and local SQL provider (SQLite or SQL Server)
3. Replace `InMemoryEventStore`/`InMemoryUserRegistrationStore` with EF Core repositories
4. Preserve business rules both in domain logic and at the database level (constraints)

### DTO Types

The API uses the following data transfer objects:

- `EventDto` - Event representation
- `CreateEventDto` - Event creation payload
- `UpdateEventDto` - Event update payload
- `RegistrationDto` - User registration payload

All DTOs are automatically generated from the backend C# classes and synchronized with the frontend TypeScript types.

## Frontend Integration

The frontend Angular application is configured to communicate with this API. Configuration details are stored in:

```
app/src/assets/config.json
```

This file contains API endpoint URLs and other environment-specific settings used by the frontend for making HTTP requests.

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

You can generate a coverage report using the built-in collector and ReportGenerator:

```bash
# From the api directory
dotnet tool restore
dotnet test --collect:"XPlat Code Coverage" --settings coverlet.runsettings --results-directory ./TestResults

# Generate HTML report
dotnet tool run reportgenerator \
  -reports:TestResults/**/coverage.cobertura.xml \
  -targetdir:coveragereport \
  -reporttypes:Html

# Open coveragereport/index.html in your browser
```

Alternatively, from the repo root you can run the prepared scripts:

```bash
npm run coverage:api
# Windows
npm run coverage:open
# Or open manually: api/coveragereport/index.html
```

The test suite currently covers:

- **EventService**: All CRUD operations, registration logic, error handling
- **InMemoryEventStore**: Data persistence, thread safety, seeding with mock data
- **Error scenarios**: Invalid operations, not found cases, validation failures

#### Interpreting the coverage report

- **Overall metrics**: Top of the report shows totals for line, branch, and method coverage. Higher is better; aim for incremental improvements over time.
- **Colors**:
  - Green: covered lines/branches
  - Red: uncovered lines/branches
  - Yellow: partially covered branches
- **Per-assembly and per-class tables**: Drill down to `src/` projects (ignore `EventManagement.Tests`). Sort by uncovered lines to find the biggest gaps.
- **Hotspots**: Focus first on uncovered code in `Application` and `Domain` layers where business logic lives.
- **Filters**: The runsettings already excludes the test assembly and auto-generated code attributes.
- **Note**: Coverage reflects only code executed by tests. Failing tests still produce coverage, but stabilize tests for trustworthy trends.

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
