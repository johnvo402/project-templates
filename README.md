# JohnVo.ProjectTemplates

Opinionated **.NET 8+ DDD + Clean Architecture + Vertical Slice/CQRS** templates by JohnVo.

The generated backend keeps the Domain framework-light, uses Minimal APIs + Mediator, and follows the practical VietWash conventions used in this template: **Command Models**, **Query Projections**, Specification + UnitOfWork, repository mapping expressions, Result/API envelopes, FluentValidation, permission authorization, and feature-oriented frontends.

## Install locally

```bash
dotnet new install ./templates/clean-api
```

## Generate

```bash
dotnet new jv-api -n MyApp
```

Full example:

```bash
dotnet new jv-api -n MyApp \
  --framework net9.0 \
  --frontend react \
  --database postgresql \
  --redis true \
  --minio true \
  --ai gemini \
  --filter true \
  --docker true
```

Options:

- `--framework net8.0|net9.0|net10.0` (default `net10.0`)
- `--frontend none|angular|react` (default `none`)
- `--database sqlserver|postgresql` (default `sqlserver`)
- `--redis true|false` (default `false`)
- `--minio true|false` (default `false`)
- `--ai gemini|openai|none` (default `gemini`)
- `--filter true|false` (default `false`)
- `--docker true|false` (default `false`)

Always included: DDD primitives, Specification, Repository/ReadOnlyRepository, UnitOfWork, Mediator, Minimal APIs, JWT + rotating HttpOnly refresh token, permission policies, FluentValidation, startup migration support, profile management, paginated Todos, CI, `justfile`, and Git initialization.

## VietWash-style application conventions

Read and write shapes are intentionally separated:

```text
Command -> *Model -> Aggregate
Query   -> Specification -> MappingExpression -> *Projection
```

For example, Todo queries use `TodoProjection.MappingExpression` and the EF repository projects in SQL:

```csharp
Task<PaginationResponse<TResult>> PagedListAsync<TResult>(
    ISpecification<TEntity>? specification,
    Expression<Func<TEntity, TResult>> mappingExpression,
    PageParameters page,
    CancellationToken cancellationToken = default);
```

When `--filter true`, LHS bracket filters/search/sort are evaluated over the projected query shape before pagination. When filtering is disabled, Todo still uses normal page/page-size pagination.

## FluentValidation

FluentValidation is always generated. Validators are discovered from Application and executed through a Mediator pipeline behavior before handlers. Validation failures are converted to HTTP 400 Problem Details.

## Development `.env` and AI keys

Copy `.env.example` to `.env`. The generated API loads `.env` **before** `WebApplication.CreateBuilder`, without overwriting variables already supplied by the OS/container.

Gemini accepts either convention:

```env
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3.8-flash
```

or:

```env
Gemini__ApiKey=your-key
Gemini__Model=gemini-3.8-flash
```

Docker forwards both conventions as well. OpenAI similarly accepts `OPENAI_API_KEY` / `OpenAI__ApiKey`.

## Profile and avatar

Profile is always included:

```text
GET /api/profile
PUT /api/profile
```

When `--minio true`, avatar support is added to Profile:

```text
GET  /api/profile/avatar
POST /api/profile/avatar
```

Avatar upload is a real `multipart/form-data` file upload. The API reads `IFormFile`, validates size/MIME/file signature, uploads the stream to MinIO, stores only the object key on the user aggregate, and returns a temporary presigned download URL. Avatar code is not generated when MinIO is disabled.

## Frontend starter

React and Angular use a Factory Mind-inspired feature layout:

```text
core/
  api/
  auth/
features/
  auth/
  profile/
  todos/
  users/
  ai/       # AI enabled only
shared/
```

Profile, permission-aware Users, paginated Todos, login/register, logout, and optional AI are wired into a polished starter UI. Avatar controls are integrated into Profile only when MinIO is enabled. With `--filter true`, Todo UI adds an LHS `$containsi` title search; otherwise it remains normal pagination.

Orval remains available through `npm run api:generate`.

## Migrations

`TemplateApp.Migrations` is a design-time executable host and is the only runtime-independent location that needs `Microsoft.EntityFrameworkCore.Design`. Migration files are emitted into Infrastructure so the API can discover/apply them without referencing the Design package.

```bash
just migrate InitialCreate
just db-update
```

The API applies pending migrations on startup by default (`Database__AutoMigrate=true`). Startup retry applies only to transient connectivity/startup errors; schema/migration errors fail fast.

## Docker and just

Docker recipes accept optional services:

```bash
just docker-up-d
just docker-up-d api db
just docker-logs api
just docker-stop api db
just docker-restart api
```

Reset the full development stack, including named volumes:

```bash
just docker-clean
```

The generated `justfile` contains concrete Compose files based on template options; it does not rely on runtime `path_exists()` expressions.

## CI / GHCR / production

`.github/workflows/ci.yml` restores/builds/tests the backend and builds the selected frontend. With Docker enabled, the GHCR workflow runs only on pushed Git tags and publishes `:prod` plus `:<full-commit-sha>` images.

Production port policy:

- React/Angular: frontend is public; API remains private behind frontend Nginx `/api` proxy.
- Backend-only: API `8080` is public.
- Database and Redis: always private.
- MinIO: API `9000` is public when enabled because browser avatar URLs are presigned against its public endpoint; console `9001` remains private.

## Git

`dotnet new jv-api` runs `git init -b main` as a template post-action. `.gitignore` is included.

## Pack

```bash
dotnet pack JV.ProjectTemplates.csproj -c Release
dotnet new install ./bin/Release/JohnVo.ProjectTemplates.1.8.9.nupkg
```
