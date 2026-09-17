# TemplateApp

Generated with `jv-api`, JohnVo's .NET 8+ DDD + Clean Architecture + Vertical Slice/CQRS starter.

The template ships a practical Mini Store / admin domain instead of a Todo sample so a generated project starts with realistic authentication, authorization, CRUD, transactional stock changes, reporting, uploads and frontend flows.

## Included by default

- DDD primitives, aggregates and domain events
- Specification + Repository / ReadOnlyRepository + UnitOfWork
- Mediator `ICommand` / `IQuery`
- FluentValidation pipeline behavior
- Query `Projection` + Command `Model` conventions
- EF-translatable mapping expressions
- Minimal APIs
- JWT access token + rotating HttpOnly refresh cookie
- permission-based authorization
- Result/API envelope + Problem Details
- profile update
- Dashboard, Products, Orders, Employees, Reports and Settings
- optimistic concurrency protection for Product/stock writes
- provider-specific EF design-time host
- startup application of pending migrations
- `justfile`, CI and automatic `git init -b main`

## Options

```text
--framework net8.0|net9.0|net10.0
--frontend none|angular|react
--database sqlserver|postgresql
--redis true|false
--minio true|false
--ai gemini|openai|none
--filter true|false
--docker true|false
```

## First run

Configure `ConnectionStrings__Default` first. The template intentionally does not ship one fixed `InitialCreate` migration because the final EF model depends on the options selected when the project is generated, especially the database provider and MinIO storage features.

Create and apply the initial migration once:

```bash
just restore
just build
just test
just init-db
just run
```

`just init-db` is equivalent to creating `InitialCreate` through the dedicated migration host and then applying it to the configured database.

After an initial migration exists, the API automatically applies pending migrations on startup when `Database__AutoMigrate=true`. If auto-migrate is enabled but no migrations exist, startup fails fast with a clear instruction instead of incorrectly reporting an empty database as up to date.

For later schema changes:

```bash
just migrate AddSomething
just db-update
just migrations
just migration-script
```

Set `Database__AutoMigrate=false` when deployment infrastructure owns migrations.

## Configuration boundary

The .NET backend uses standard ASP.NET Core configuration providers. It does not parse a project `.env` file.

For local backend development without Docker, use `appsettings.Development.json`, `dotnet user-secrets`, or canonical ASP.NET environment variables such as:

```text
ConnectionStrings__Default
Jwt__Issuer
Jwt__Key
Database__AutoMigrate
Gemini__ApiKey
OpenAI__ApiKey
Redis__Configuration
Minio__Endpoint
Minio__PublicEndpoint
```

When generated with `--docker true`, `.env.example` exists only for Docker Compose interpolation. Docker maps user-facing `UPPER_SNAKE_CASE` aliases to canonical ASP.NET keys inside the API container.

For example:

```env
JWT_ISSUER=TemplateApp
JWT_KEY=change-me
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3.8-flash
AUTO_MIGRATE=true
```

maps to configuration such as:

```text
Jwt__Issuer
Jwt__Key
Gemini__ApiKey
Gemini__Model
Database__AutoMigrate
```

OpenAI follows the same boundary. `OPENAI_API_KEY` / `OPENAI_MODEL` are Docker inputs and become `OpenAI__ApiKey` / `OpenAI__Model` for ASP.NET Core.

## Mini Store domain

### Dashboard

`GET /api/dashboard` returns an operational snapshot containing revenue, orders, products, employees, low-stock count, revenue series, status totals, top products and recent orders.

Dashboard reads operational data directly. It is intentionally not backed by Redis cache.

### Products

Products contain:

- name
- unique SKU
- price
- stock quantity
- active state
- created / updated timestamps
- one optional image when MinIO is enabled

Queries return `ProductProjection`; create/update commands receive `ProductModel` plus an optional image model only in MinIO builds.

Without LHS filtering:

```text
GET /api/products?page=1&pageSize=20
```

With `--filter true`, filtering/search/sorting is translated before pagination, for example:

```text
GET /api/products?page=1&pageSize=20&filter[Name][$containsi]=keyboard
```

### Orders

Orders snapshot product name and price into order items and support guarded transitions through:

```text
Pending -> Processing -> Completed
        -> Cancelled
```

Creating an order decrements stock transactionally. Cancelling restores stock. Order domain events are raised for create, complete and cancel.

Orders are intentionally not cached through Redis.

### Employees

Employees reuse the existing `AppUser` aggregate rather than introducing a duplicate employee identity model.

- Admin can create employees, change roles and change status.
- Manager can view employees.
- authorization is enforced through permission policies rather than direct role checks in endpoints.

With `--filter true`, Employee filtering and sorting is evaluated before pagination.

### Reports

Reports include revenue, order-status totals and top products. Reports read directly from operational data and are intentionally not cached so totals are not made stale by an application cache.

### Settings

Store settings include store name, email, phone, currency, timezone and low-stock threshold. `settings.update` controls modification access.

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
GetProductsQuery  -> ProductProjection
GetOrdersQuery    -> OrderSummaryProjection
GetEmployeesQuery -> EmployeeProjection
```

This keeps database projection server-side instead of loading complete aggregates and mapping them in memory.

## Product and stock concurrency

`Product.ConcurrencyStamp` is a `Guid` configured with `.IsConcurrencyToken()`. Product updates and stock adjustments rotate the stamp.

If another request changes the same Product first, EF raises `DbUpdateConcurrencyException`. `UnitOfWork` translates it to `PersistenceConcurrencyException`, and the API maps the conflict to **HTTP 409**. A persistence test uses two independent EF contexts to verify a stale stock writer cannot silently overwrite a newer stock value.

## MinIO uploads

When `--minio true`, the generated app adds real file upload flows and stores object keys in the database.

### Profile avatar

```text
GET  /api/profile/avatar
POST /api/profile/avatar
```

The upload endpoint accepts `multipart/form-data` field `file`. JPEG, PNG and WebP files are accepted up to 5 MB, with both MIME and file-signature validation.

### Product image

There is no separate Product Images endpoint or image collection. Product create/update themselves accept `multipart/form-data` with the normal Product fields and an optional `image` field:

```text
POST /api/products
PUT  /api/products/{id}
```

Each Product has at most one image. Create may include it. Update without a new image leaves the existing object and database reference untouched. Update with a replacement uploads the new object, persists the new reference, then deletes the previous object; if persistence fails, the new upload is compensated. Product deletion performs best-effort cleanup of its stored image.

`Minio__Endpoint` is the internal API endpoint. `Minio__PublicEndpoint` remains available for browser-reachable object-storage URLs when an application needs them.

When MinIO is disabled, Product image storage state, multipart Product forms and upload implementations are not generated into the application surface.

## Redis

`--redis true` generates Redis infrastructure for applications that need it, but the Mini Store sample deliberately does **not** cache Orders, Dashboard or Reports.

This keeps stock/order reads straightforward, Dashboard fresh, and report totals free from application-cache staleness.

## Frontend

React and Angular use a feature-oriented split:

```text
app/                  # application composition / shell
core/                 # API and auth infrastructure
components/           # reusable UI
feedback/             # notifications / user feedback
query/                # cross-feature list/query helpers
utils/                # generic formatting/error helpers
features/              # business capabilities
  auth/
  business/
  profile/
  ai/                  # optional
pagination.ts
pagination.css
```

The starter UI includes:

- authentication
- profile editing
- permission-aware navigation
- Dashboard
- Products
- Orders
- Employees
- Reports
- Settings

Avatar and the inline Product image picker are generated only with MinIO. AI UI is generated only when an AI provider is selected.

The dashboard obtains fresh API snapshots. Reports are fetched from their direct API endpoints rather than a client-side business cache.

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

`src/TemplateApp.Migrations` is the dedicated design-time executable host. `Microsoft.EntityFrameworkCore.Design` does not need to be referenced by the API project.

Common commands:

```bash
just init-db
just migrate AddSomething
just migrate-remove
just db-update
just migrations
just migration-script
```

Migration files live in Infrastructure. Generate migrations from the final generated project so EF captures the selected database provider and optional model features correctly.

## Docker

When generated with `--docker true`:

```bash
cp .env.example .env
just docker-services
just docker-up-d
just docker-up-d api db
just docker-logs api
just docker-stop api db
just docker-restart api db
just docker-clean
```

`docker-clean` is intentionally stack-wide and performs `down -v --remove-orphans`.

For production Docker configuration:

```bash
cp .env.production.example .env.production
just prod-up
```

`:prod` is the default GHCR image tag. Set `IMAGE_TAG=<full-commit-sha>` to deploy or roll back to a specific image.

Production exposes only required edge ports. Database, Redis, API-behind-frontend and the MinIO console remain private unless explicitly configured otherwise.

## CI coverage

The template smoke workflow generates, restores, builds and tests representative combinations including:

- .NET 10 default
- .NET 9 default
- .NET 9 full stack with React, PostgreSQL, Redis infrastructure, MinIO, AI, filters and Docker
- .NET 9 Angular
- .NET 9 filter-disabled
- .NET 8 + SQL Server

CI also rejects legacy Todo starter artifacts, business-cache dependencies in Orders/Dashboard/Reports, invalid environment boundaries and untransformed template names.
