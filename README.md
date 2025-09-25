# Eventify

## Monorepo

Single source of truth for data transfer objects, updates in BE auto update FE and CI-CD can be updated to ensure deployment breaks if FE doesn't build.

Positive side, mitigates misaligned DTO contract.
Downside, requires front end and back end changes that involve DTO schema changes to deploy together.

```bash
# Build backend (emits openapi.json via MSBuild Target), then generate TS DTOs
dotnet build ./backend/src/Presentation/EventManagement.Presentation.csproj -c Debug

npm run dto:gen
```

TODO integrate into github PR review hooks.


### FE usage

// frontend/app/src/app/features/events/events.service.ts
import type { paths } from '../../dto/api-types';
// Example: paths['/events']['get']['responses']['200']['content']['application/json']


### BE enforement

TODO

CI: enforce DTO sync on PRs (GitHub Actions)

Create .github/workflows/ci.yml:

name: CI

on:
  pull_request:
  push:
    branches: [ main ]

jobs:
  build-test-dto:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dotnet swagger tool
        run: dotnet tool install --global Swashbuckle.AspNetCore.Cli
        env:
          DOTNET_SKIP_FIRST_TIME_EXPERIENCE: true

      - name: Restore & Build Backend
        run: dotnet build ./backend/src/Presentation/EventManagement.Presentation.csproj -c Release

      - name: Install NPM deps
        run: npm ci

      - name: Generate DTOs
        run: npm run dto:gen

      - name: Verify no drift
        run: |
          if ! git diff --exit-code; then
            echo "::error::DTOs out of sync. Run 'dotnet build' then 'npm run dto:gen' and commit."
            exit 1
          fi

      # TODO: add test steps (xUnit, Angular unit/E2E) per PRD
