# TemplateApp

Generated with `jv-api`, JohnVo's .NET 8+ DDD + Clean Architecture + Vertical Slice/CQRS starter.

## What is always included

- DDD primitives, aggregates and concrete domain events
- Specification + Repository/ReadOnlyRepository + UnitOfWork
- Query `Projection` + Command `Model` conventions with SQL mapping expressions
- Mediator `ICommand` / `IQuery`
- FluentValidation through a Mediator pipeline behavior
- Minimal APIs
- JWT access token + rotating HttpOnly refresh cookie
- permission-based authorization
- Result/API envelope + Problem Details
- profile update
- paginated Todo feature
- automatic startup migrations (`Database__AutoMigrate=true`)
- `justfile`, CI and automatic `git init -b main`

## Options

- `--framework net8.0|net9.0|net10.0`
- `--frontend none|angular|react`
- `--database sqlserver|postgresql`
- `--redis true|false`
- `--minio true|false`
- `--ai gemini|openai|none`
- `--filter true|false`
- `--docker true|false`

## First run

```bash
cp .env.example .env
just build
just test
```

Create the first migration if the project does not have one yet:

```bash
just migrate InitialCreate
```

Run the API:

```bash
just run
```

The API itself loads the nearest project `.env` before `WebApplication.CreateBuilder`, so raw `dotnet run --project src/TemplateApp.Api` also sees the same values. Existing OS/container variables take precedence.

## Gemini / OpenAI configuration

Gemini supports either:

```env
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3.8-flash
```

or:

```env
Gemini__ApiKey=your-key
Gemini__Model=gemini-3.8-flash
```

Docker forwards both naming conventions. OpenAI works the same way with `OPENAI_API_KEY` / `OpenAI__ApiKey`.

## Projection / Model convention

Commands receive explicit Models:

```text
CreateTodoCommand(TodoModel Model)
UpdateProfileCommand(UserProfileModel Model)
```

Queries return Projections and pass their expression directly into the repository:

```text
TodoProjection.MappingExpression
UserProfileProjection.MappingExpression
UserSummaryProjection.MappingExpression
```

This keeps EF projection server-side rather than loading aggregates and mapping them in memory.

## Todo pagination and filtering

Todo always returns `PaginationResponse<TodoProjection>`.

Without LHS filtering:

```text
GET /api/todos?page=1&pageSize=20
```

With `--filter true`:

```text
GET /api/todos?page=1&pageSize=20&filter[Title][$containsi]=wash
```

The filtered repository path applies the entity specification, projects with `MappingExpression`, applies LHS filter/search/sort to the projection query, counts, then paginates.

## Profile and MinIO avatar

Profile is always present:

```text
GET /api/profile
PUT /api/profile
```

When MinIO is enabled:

```text
GET  /api/profile/avatar
POST /api/profile/avatar
```

The upload endpoint accepts `multipart/form-data` field `file`. Backend validation allows JPEG/PNG/WebP up to 5 MB and checks the file signature before uploading to MinIO. The user aggregate stores the object name; clients receive a temporary presigned download URL.

`Minio__Endpoint` is the internal API endpoint and `Minio__PublicEndpoint` must be browser-reachable for avatar download URLs.

## Frontend

React/Angular follow a Factory Mind-inspired split:

```text
core/
  api/
  auth/
features/
  auth/
  profile/
  todos/
  users/
  ai/       # optional
shared/
```

The starter UI includes authentication, profile editing, permission-aware user management, Todo paging, optional LHS Todo search, and optional AI. Avatar UI appears only with MinIO.

If a frontend is generated:

```bash
cd frontend
npm install
npm run api:generate
npm run dev      # React
# npm start      # Angular
```

## EF migrations without Design package in API

`src/TemplateApp.Migrations` is a dedicated design-time executable host. `Microsoft.EntityFrameworkCore.Design` is not required by the API project.

```bash
just migrate InitialCreate
just db-update
just migrations
just migration-script
```

Migration files live in Infrastructure. On API startup, pending migrations are automatically applied. Set `Database__AutoMigrate=false` when deployment infrastructure owns migration execution.

## Docker commands

```bash
just docker-services
just docker-up-d
just docker-up-d api db
just docker-logs api
just docker-stop api db
just docker-restart api
just docker-clean
```

`docker-clean` is intentionally stack-wide and performs `down -v --remove-orphans`.

## Production

```bash
cp .env.production.example .env.production
just prod-up
```

`:prod` is the default GHCR image tag. Set `IMAGE_TAG=<full-commit-sha>` to roll back to an older tagged build.

Production publishes only the required edge ports: frontend when present, API only for backend-only projects, and MinIO API `9000` when MinIO is enabled. DB, Redis, API-behind-frontend and MinIO console stay private.
