# DTO Sync Tool

This tool automatically generates TypeScript interfaces from C# DTOs using the OpenAPI specification from the running API.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Running Eventify API at `http://localhost:5146`

### Install Dependencies
```bash
npm install
```

### Generate DTOs
```bash
# From tools/dto-sync directory
node generate-dtos.js

# Or from project root
npm run dto:generate

# Or using Docker
npm run dto:generate:docker
```

## 📁 Output

Generated files are placed in `app/src/app/shared/dto/`:

```
app/src/app/shared/dto/
├── index.ts           # Barrel export for clean imports
└── model/
    ├── event-dto.ts
    ├── create-event-dto.ts
    ├── registration-dto.ts
    └── update-event-dto.ts
```

## 🔧 Usage Examples

### Import DTOs in Angular Services
```typescript
import { EventDto, CreateEventDto } from '../shared/dto';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  constructor(private http: HttpClient) {}

  getEvents(): Observable<EventDto[]> {
    return this.http.get<EventDto[]>('/api/events');
  }

  createEvent(event: CreateEventDto): Observable<EventDto> {
    return this.http.post<EventDto>('/api/events', event);
  }
}
```

### Type-Safe Components
```typescript
import { EventDto } from '../shared/dto';

@Component({...})
export class EventListComponent {
  events: EventDto[] = [];

  // TypeScript will enforce correct property access
  getEventTitle(event: EventDto): string {
    return event.title; // ✅ Type-safe
    // return event.nonExistent; // ❌ TypeScript error
  }
}
```

## 🐳 Docker Usage

### Build and Run
```bash
# Build the Docker image
docker build -t eventify-dto-sync .

# Run DTO generation
docker run --rm \
  -v $(pwd)/app/src/app/shared/dto:/app/output \
  -e API_URL=http://host.docker.internal:5146 \
  eventify-dto-sync
```

### Docker Compose
```bash
# From project root
docker-compose -f tools/dto-sync/docker-compose.yml up dto-sync
```

## ⚙️ Configuration

### Environment Variables
- `API_URL`: API base URL (default: `http://localhost:5146`)

### Type Mappings
The tool includes custom type mappings for C# to TypeScript conversion:
- `DateTime` → `string`
- `DateOnly` → `string`
- `Guid` → `string`

## 🔍 Verification

### Verify DTO Sync
```bash
node tools/dto-sync/verify-dto-sync.js
```

This script checks:
- API accessibility
- DTO directory existence
- Generated files presence
- File freshness (warns if >24 hours old)

## 🔄 Development Workflow

### Automatic Generation
The tool integrates into the build process:

1. **Pre-build**: DTOs are automatically generated before Angular builds
2. **Pre-commit**: Git hooks verify DTO synchronization
3. **CI/CD**: GitHub Actions verify and regenerate DTOs

### Manual Workflow
```bash
# 1. Start the API
npm run start:api

# 2. Generate DTOs
npm run dto:generate

# 3. Build frontend
npm run build:frontend

# 4. Verify everything works
npm run test
```

## 🐛 Troubleshooting

### API Not Accessible
```
❌ Failed to generate DTOs
💡 Make sure the API is running and accessible at: http://localhost:5146
```

**Solution**: Start the API first
```bash
npm run start:api
```

### No DTO Files Generated
**Check**:
- API is running and Swagger is accessible
- Output directory exists and is writable
- No network/firewall issues

### Type Errors After Generation
**Common issues**:
- API contract changed but DTOs not regenerated
- Missing null-safety checks
- Date/time format mismatches

**Solution**: Regenerate DTOs and update consuming code
```bash
npm run dto:generate
```

## 📋 File Structure

```
tools/dto-sync/
├── generate-dtos.js          # Main generation script
├── verify-dto-sync.js        # Verification utility
├── package.json              # Dependencies
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose setup
└── README.md                 # This file
```

## 📝 Implementation Notes

### Manual Adjustments
- **EventDto**: Created manually as it's not explicitly defined in OpenAPI schemas but returned by API endpoints
- **Interface Names**: Cleaned up generated interface names by removing duplicate "Dto" suffixes (e.g., `CreateEventDtoDto` → `CreateEventDto`)

### Current Generated DTOs
- `CreateEventDto` - For creating new events
- `UpdateEventDto` - For updating existing events
- `RegistrationDto` - For user registration data
- `EventDto` - For event response data (manually created)

## 🤝 Contributing

When modifying C# DTOs:
1. Update the DTO classes in `api/src/Application/Dtos/`
2. Run `npm run dto:generate` to update TypeScript interfaces
3. If adding new DTOs or changing response structures, update the generated files accordingly
4. Update any consuming code if contracts changed
5. Commit both backend and generated frontend changes together

### DTO Maintenance
- The tool uses Docker by default for consistent generation across environments
- Pre-commit hooks verify DTO synchronization
- CI/CD automatically regenerates DTOs on API changes
