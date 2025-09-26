# Eventify

Event management system with comprehensive event CRUD operations and user registration functionality.

## Architecture

- **Backend**: .NET 9 Web API with Clean Architecture (Domain/Application/Infrastructure/Presentation layers)
- **Frontend**: Angular application with TypeScript DTOs auto-generated from OpenAPI spec
- **Features**: Event management, user registration/unregistration, business rule validation

## Key Capabilities

- ✅ Complete event lifecycle management (CRUD operations)
- ✅ User registration system with business rules (capacity limits, past event prevention, duplicate prevention)
- ✅ Comprehensive unit test coverage
- ✅ Monorepo setup with automated DTO synchronization
- ✅ Clean Architecture principles

## 🚀 Onboarding

Welcome to Eventify! This guide will help you get started with development on our event management platform.

### Prerequisites

- **Node.js 18+** - Required for frontend and tooling
- **.NET 9 SDK** - Required for backend API
- **Docker** (optional but recommended) - For consistent DTO generation
- **Git** - Version control

### Quick Start

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd eventify
   npm run install:all  # Installs all dependencies
   ```

2. **Start development environment:**
   ```bash
   npm start  # Starts API + Frontend + auto-generates DTOs
   ```

3. **Verify setup:**
   - API: http://localhost:5146/swagger
   - Frontend: http://localhost:4200
   - DTOs: `app/src/app/shared/dto/`

### 🏗️ Architecture Overview

Eventify uses a **monorepo** structure with automated DTO synchronization:

- **Backend**: .NET 9 Web API (Clean Architecture)
- **Frontend**: Angular with auto-generated TypeScript interfaces
- **DTO Sync**: Single source of truth ensures type safety across full stack

### 📋 Daily Development Workflow

#### Starting Your Day
```bash
# Start everything at once
npm start

# Or start components separately
npm run start:api      # API on http://localhost:5146
npm run start:frontend # Angular on http://localhost:4200
```

#### Backend Changes (C# DTOs)
When modifying `api/src/Application/Dtos/`:

1. **Update C# DTOs** in `api/src/Application/Dtos/`
2. **Generate TypeScript interfaces:**
   ```bash
   npm run dto:generate
   ```
3. **Frontend gets type-safe interfaces** in `app/src/app/shared/dto/`

#### Frontend Development
Use auto-generated DTOs for type safety:

```typescript
import { EventDto, CreateEventDto } from '../shared/dto';

@Injectable({ providedIn: 'root' })
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

### Frontend API Configuration & DRY Pattern

- Runtime config is loaded from `app/src/assets/config.json` at startup via `AppConfigService` using `APP_INITIALIZER`.
- Feature services use a shared `BaseApiService` to eliminate repeated base URL building, params/headers handling, and error/log plumbing.
- `LoggingService` is consumed by the base service so all requests and failures are logged centrally.

Key files:
- `app/src/app/shared/config/app-config.service.ts`
- `app/src/app/shared/api/base-api.service.ts`
- `app/src/app/shared/api/event.service.ts`
- `app/src/app/shared/logging/logging.service.ts`
- `app/src/assets/config.json`

Benefits:
- Don’t Repeat Yourself (DRY)
- Single source of truth for API endpoints
- Centralized logging and error handling

#### Before Committing
Pre-commit hooks automatically verify DTO synchronization:

```bash
git add .
git commit -m "Your changes"
# ✅ Pre-commit hook verifies DTOs are in sync
```

### 🔄 DTO Synchronization

**How it works:**
1. C# DTOs → OpenAPI spec (runtime) → TypeScript interfaces
2. Ensures type safety across backend/frontend boundary
3. Prevents contract drift between services

**Manual generation:**
```bash
# Local generation (requires API running)
npm run dto:generate

# Docker generation (isolated, recommended)
npm run dto:generate:docker
```

**Generated files:**
```
app/src/app/shared/dto/
├── index.ts           # Clean imports: import { EventDto } from '../shared/dto'
└── model/
    ├── eventDto.ts
    ├── createEventDto.ts
    ├── updateEventDto.ts
    └── registrationDto.ts
```

### 🧪 Testing & Quality

#### Running Tests
```bash
# All tests
npm test

# Backend only
npm run test:api

# Frontend only
npm run test:frontend
```

#### Building
```bash
# Full build (includes DTO generation)
npm run build

# Individual builds
npm run build:api
npm run build:frontend
```

### 🚢 CI/CD Pipeline

**GitHub Actions** automatically:
- Builds backend and generates DTOs
- Builds frontend with generated types
- Runs all tests
- Verifies DTO synchronization
- Fails PRs if DTOs are out of sync

**Local CI simulation:**
```bash
npm run build  # Same process as CI/CD
```

### 🐳 Docker Development

For consistent environments across team:

```bash
# Full development environment
npm run docker:dev

# Individual services
docker-compose -f docker-compose.dev.yml up api
docker-compose -f docker-compose.dev.yml up dto-sync
```

### 🔧 Troubleshooting

#### API Won't Start
```bash
# Check if port 5146 is available
netstat -ano | findstr :5146

# Kill process if needed
taskkill /PID <PID> /F

# Restart
npm run start:api
```

#### CORS Errors in Swagger
API is configured with CORS for development:
- ✅ Angular: `http://localhost:4200`
- ✅ Swagger HTTP: `http://localhost:5146`
- ✅ Swagger HTTPS: `https://localhost:7013`

#### DTO Generation Fails
```bash
# Ensure API is running first
npm run start:api

# Check API health
curl http://localhost:5146/swagger/v1/swagger.json

# Regenerate
npm run dto:generate
```

#### Type Errors After Backend Changes
```bash
# Regenerate DTOs after backend changes
npm run dto:generate

# Rebuild frontend
npm run build:frontend
```

### 📚 Key Files & Directories

```
eventify/
├── api/                          # .NET Backend
│   ├── src/Application/Dtos/     # C# DTOs (source of truth)
│   └── appsettings.json          # CORS configuration
├── app/                          # Angular Frontend
│   └── src/app/shared/dto/       # Generated TypeScript interfaces
├── tools/dto-sync/              # DTO generation tooling
├── docker-compose.dev.yml       # Development environment
├── package.json                 # Root orchestration scripts
└── .github/workflows/           # CI/CD pipelines
```

### 🔜 Roadmap: AuthN/AuthZ
- Replace mocked `GET /users/me` endpoint with real authentication (OIDC) and authorization roles (admin/user).
- Remove front-end assumptions about a hard-coded user; the app already initializes by fetching the current user and passes the `userId` to list events so the API can decorate each `EventDto` with `isRegistered` for that user.
- Extend user context to include permissions and claims for admin features (create/update events).

### 🔜 Roadmap: App Config Validation in CI/CD
- Publish a typed config contract: `app/src/app/shared/config/app-config.model.ts` (`AppConfig` interface and `APP_CONFIG` token).
- Add a CI step to validate `app/public/assets/config.json` against `AppConfig` at build time (TypeScript validator) and fail the pipeline on mismatch.

### Style Guide: Runtime App Config (Angular 20)
- Use `provideAppInitializer` and a `ConfigLoader` to block bootstrap until config is loaded.
- Expose a single `APP_CONFIG` token and inject it where needed with `inject<AppConfig>(APP_CONFIG)`.
- Do not inject services that depend on config before initialization; resolve from the loader in the token provider to avoid races.

### 🤝 Contributing

1. **Backend changes**: Update C# DTOs → Run `npm run dto:generate`
2. **Frontend changes**: Use generated DTOs for type safety
3. **New features**: Add tests and update documentation
4. **Commits**: Pre-commit hooks ensure quality checks

- Important: Do not commit from in-editor assistants (Cursor). Review and commit changes manually from your Git client/terminal.

**Need help?** Check the detailed docs in each feature directory or ask in team chat!
