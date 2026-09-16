# TemplateApp

Generated with `jv-api`, JohnVo's .NET 8+ DDD + Clean Architecture + Vertical Slice/CQRS starter.

## What is always included

- DDD primitives, aggregates and concrete domain events
- Specification + Repository/ReadOnlyRepository + UnitOfWork
- Query `Projection` + Command `Model` conventions with EF-translatable mapping expressions
- Mediator `ICommand` / `IQuery`
- FluentValidation through a Mediator pipeline behavior
- Minimal APIs
- JWT access token + rotating HttpOnly refresh cookie
- permission-based authorization
- Result/API envelope + Problem Details
- profile update
- Mini Store modules: Dashboard, Products, Orders, Employees, Reports and Settings
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
just build
just test
just run
```

The .NET backend uses standard ASP.NET Core configuration providers. It does not parse a project `.env` file.

For local backend development without Docker, use `appsettings.Development.json`, `dotnet user-secrets`, or canonical ASP.NET environment variables such as:

```text
ConnectionStrings__Default
Jwt__Issuer
Jwt__Key
Gemini__ApiKey
OpenAI__ApiKey
Redis__Configuration
Minio__Endpoint
```

## Docker `.env` and AI configuration

When generated with `--docker true`, `.env.example` is generated only for Docker Compose interpolation:

```bash
cp .env.example .env
```

The `.env` file uses user-facing `UPPER_SNAKE_CASE` aliases. Docker Compose maps them to canonical ASP.NET keys consumed by the API.

```env
JWT_ISSUER=TemplateApp
JWT_KEY=change-me
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3.8-flash
```

becomes container configuration equivalent to:

```text
Jwt__Issuer
Jwt__Key
Gemini__ApiKey
Gemini__Model
```

OpenAI follows the same boundary: `OPENAI_API_KEY` and `OPENAI_MODEL` are Docker inputs and are mapped to `OpenAI__ApiKey` and `OpenAI__Model` inside the API container.

## Mini Store sample

The starter uses a practical Mini Store domain rather than a Todo example.

### Dashboard

`GET /api/dashboard` returns an operational snapshot including revenue, order counts, products, employees, low-stock count, top products and recent orders.

Dashboard reads operational data directly. It is intentionally not backed by Redis cache.

### Products

Products contain name, unique SKU, price, stock, active state and timestamps. Query results use `ProductProjection`; create/update commands use `ProductModel`.

Without LHS filtering:

```text
GET /api/products?page=1&pageSize=20
```

With `--filter true`, LHS filter/search/sort is applied to the projected query before pagination, for example:

```text
GET /api/products?page=1&pageSize=20&filter[Name][$containsi]=keyboard
```

### Orders

Orders snapshot product name/price into items and support guarded status changes through `Pending`, `Processing`, `Completed` and `Cancelled`.

Creating an order decrements stock transactionally. Cancelling an order restores stock. Order domain events are raised for create/complete/cancel.

Orders are intentionally not cached through Redis.

### Employees

Employees reuse the existing `AppUser` aggregate. Admin can create/change role/change status; Manager has view access. Authorization is enforced through permission policies rather than direct role checks in endpoints.

With `--filter true`, Employee list filtering/sorting is evaluated before pagination.

### Reports

Reports include revenue, order-status totals and top products. They read directly from operational data and are intentionally not cached, avoiding stale report values.

### Settings

Store settings include store name/email/phone, currency, timezone and low-stock threshold. `settings.update` controls modification access.

## Projection / Model convention

Commands receive explicit Models:

```text
CreateProductCommand(ProductModel Model)
UpdateProductCommand(Guid Id, ProductModel Model)
CreateOrderCommand(CreateOrderModel Model)
UpdateProfileCommand(UserProfileModel Model)
```

Queries return Projections and pass EF-translatable selectors into repositories:

```text
GetProductsQuery -> ProductProjection
GetOrdersQuery   -> OrderSummaryProjection
GetEmployeesQuery -> EmployeeProjection
```

This keeps database projection server-side instead of loading complete aggregates and mapping them in memory.

## Product concurrency

`Product.ConcurrencyStamp` is a `Guid` configured with `.IsConcurrencyToken()`. Product updates and stock adjustments rotate the stamp.

If another request changes the same Product first, EF raises `DbUpdateConcurrencyException`. `UnitOfWork` translates the exception to `PersistenceConcurrencyException`, and the API maps it to **HTTP 409 Conflict** so stale writes cannot silently overwrite current stock.

## Profile and MinIO uploads

Profile is always present:

```text
GET /api/profile
PUT /api/profile
```

When MinIO is enabled, avatar upload is added:

```text
GET  /api/profile/avatar
POST /api/profile/avatar
```

The upload endpoint accepts real `multipart/form-data` field `file`. Backend validation allows JPEG/PNG/WebP up to 5 MB and checks the file signature before uploading. The user stores only the object key; clients receive a temporary presigned URL.

MinIO also enables multiple Product Images:

```text
GET    /api/products/{id}/images
POST   /api/products/{id}/images
DELETE /api/products/{id}/images/{imageId}
PUT    /api/products/{id}/images/{imageId}/primary
```

The first image becomes primary, images can be promoted to primary, and the starter limits each product to a small image set. The database stores object keys, not temporary URLs.

`Minio__Endpoint` is the canonical ASP.NET configuration key for the internal API endpoint and `Minio__PublicEndpoint` must be browser-reachable for presigned downloads. Docker Compose maps `.env` aliases to these canonical keys.

## Frontend

React/Angular follow a feature-oriented split:

```text
core/
  api/
  auth/
features/
  auth/
  business/
  profile/
  ai/       # optional
shared/
```

The starter UI includes authentication, profile editing and a permission-aware Mini Store workspace with Dashboard, Products, Orders, Employees, Reports and Settings. Avatar UI appears only with MinIO. AI UI appears only when an AI provider is generated.

The Angular dashboard periodically refreshes its direct API snapshot; Reports are fetched fresh rather than cached.

If a frontend is generated:

```bash
cd frontend
npm install
npm run api:generate
npm run dev      # React
# npm start      # Angular
```

Frontend-specific environment variables belong to the frontend project and remain separate from backend configuration.

## EF migrations

`src/TemplateApp.Migrations` is a dedicated design-time executable host. `Microsoft.EntityFrameworkCore.Design` is not required by the API project.

```bash
just migrate InitialCreate
just db-update
just migrations
just migration-script
```

Migration files live in Infrastructure. On API startup, pending migrations are automatically applied. Set `Database__AutoMigrate=false` when deployment infrastructure owns migrations. With Docker, set `AUTO_MIGRATE=false` in `.env` and Compose maps it to `Database__AutoMigrate`.

## Docker commands

When generated with `--docker true`:

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

For Docker-enabled projects:

```bash
cp .env.production.example .env.production
just prod-up
```

`:prod` is the default GHCR image tag. Set `IMAGE_TAG=<full-commit-sha>` to roll back to an older tagged build.

Production publishes only required edge ports: frontend when present, API only for backend-only projects, and MinIO API `9000` when MinIO is enabled. DB, Redis, API-behind-frontend and MinIO console remain private.
