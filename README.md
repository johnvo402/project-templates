# JohnVo.ProjectTemplates

Opinionated **.NET 8+ DDD + Clean Architecture + Vertical Slice/CQRS** templates by JohnVo.

The generated backend keeps Domain framework-light, uses Minimal APIs + Mediator, and follows practical VietWash-style conventions: **Command Models**, **Query Projections**, Specification + UnitOfWork, repository mapping expressions, Result/API envelopes, FluentValidation, permission authorization, and feature-oriented frontends.

The default sample is a small **Mini Store Admin** rather than a toy Todo app. It gives a generated project realistic aggregates, cross-feature queries, permissions, file uploads, reporting, pagination, concurrency handling, and a usable React/Angular workspace without turning the starter into a full ERP.

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

Always included: DDD primitives, Specification, Repository/ReadOnlyRepository, UnitOfWork, Mediator, Minimal APIs, JWT + rotating HttpOnly refresh token, permission policies, FluentValidation, startup migrations, profile management, Mini Store business modules, CI, `justfile`, and Git initialization.

## Mini Store modules

The generated starter includes:

- **Dashboard** — revenue/order/product/employee/low-stock snapshot, top products and recent orders.
- **Products** — SKU, pricing, stock, active state and pagination.
- **Orders** — product snapshots, guarded status transitions, stock decrement/restore and domain events.
- **Employees** — reuses `AppUser`; Admin/Manager access is permission-based.
- **Reports** — revenue, orders by status and top products.
- **Settings** — store identity, currency, timezone and low-stock threshold.
- **Profile/Auth** — login/register/refresh/logout and profile update.

Roles are `Admin`, `Manager`, and `Staff`, while API/UI authorization is enforced through permissions such as `products.update`, `orders.cancel`, `employees.view`, `reports.view`, and `settings.update` rather than hard-coded role checks.

Dashboard and Reports read operational data directly. Orders, Dashboard and Reports are intentionally **not wired to Redis caching**, avoiding stale stock/order/report data. Redis remains an optional infrastructure capability for application-specific extensions.

## VietWash-style application conventions

Read and write shapes are intentionally separated:

```text
Command -> *Model -> Aggregate
Query   -> Specification -> MappingExpression -> *Projection
```

For example, Products use command models and query projections while repository selectors remain EF-translatable:

```text
CreateProductCommand(ProductModel Model)
UpdateProductCommand(Guid Id, ProductModel Model)
GetProductsQuery -> ProductProjection
```

The repository projects in SQL rather than loading aggregates and mapping them in memory.

When `--filter true`, Products, Orders and Employees accept LHS-bracket filter/search/sort parameters and evaluate them over the projected query before pagination. When filtering is disabled, those lists use normal page/page-size pagination.

## Concurrency and stock safety

`Product` carries a provider-independent `Guid` concurrency stamp configured as an EF Core concurrency token. Product updates and stock changes rotate the stamp. Concurrent stale writes therefore raise `DbUpdateConcurrencyException`; `UnitOfWork` translates that to `PersistenceConcurrencyException`, and the API returns **HTTP 409 Conflict**.

Order creation decrements stock transactionally, while cancellation restores it. The concurrency token prevents two stale order flows from silently overwriting the same product stock value.

## FluentValidation

FluentValidation is always generated. Validators are discovered from Application and executed through a Mediator pipeline behavior before handlers. Validation failures become HTTP 400 Problem Details.

## Configuration and `.env`

The .NET backend uses standard ASP.NET Core configuration providers only. It does **not** parse a project `.env` file and does not know Docker-facing aliases such as `JWT_ISSUER` or `GEMINI_API_KEY`.

When `--docker true`, the template generates `.env.example`. Copy it to `.env` for Docker Compose interpolation:

```env
JWT_ISSUER=TemplateApp
JWT_KEY=change-me
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3.8-flash
```

Compose maps those aliases to canonical ASP.NET keys inside the API container:

```text
JWT_ISSUER      -> Jwt__Issuer
JWT_KEY         -> Jwt__Key
GEMINI_API_KEY  -> Gemini__ApiKey
GEMINI_MODEL    -> Gemini__Model
```

For direct backend development, use `appsettings.Development.json`, `dotnet user-secrets`, or canonical environment variables such as:

```text
ConnectionStrings__Default
Jwt__Issuer
Jwt__Key
Gemini__ApiKey
OpenAI__ApiKey
Redis__Configuration
Minio__Endpoint
```

Frontend-specific environment variables belong to the frontend project rather than the backend configuration pipeline.

## MinIO: avatar and product images

Profile is always included:

```text
GET /api/profile
PUT /api/profile
```

When `--minio true`, real multipart file upload is added for avatars and Product Images:

```text
GET  /api/profile/avatar
POST /api/profile/avatar

GET    /api/products/{id}/images
POST   /api/products/{id}/images
DELETE /api/products/{id}/images/{imageId}
PUT    /api/products/{id}/images/{imageId}/primary
```

Uploads accept `multipart/form-data` field `file`. The backend validates JPEG/PNG/WebP, checks file signatures and limits uploads to 5 MB. Product Images support multiple images per product, with one primary image. The database stores object keys rather than presigned URLs; clients receive temporary download URLs generated by object storage.

Storage-specific code is overlaid only when MinIO is enabled. Profile avatar UI is likewise generated only for MinIO builds.

## Frontend starter

React and Angular use a feature-oriented layout:

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

The workspace includes a permission-aware sidebar and screens for Dashboard, Products, Orders, Employees, Reports, Settings and Profile. AI remains optional. Dashboard data is fetched directly and the Angular workspace refreshes its operational snapshot periodically; Reports are fetched fresh rather than cached.

If a frontend is generated:

```bash
cd frontend
npm install
npm run api:generate
npm run dev      # React
# npm start      # Angular
```

Orval remains available through `npm run api:generate`.

## Migrations

`TemplateApp.Migrations` is a design-time executable host and the only runtime-independent location that needs `Microsoft.EntityFrameworkCore.Design`. Migration files are emitted into Infrastructure so the API can discover/apply them without referencing the Design package.

```bash
just migrate InitialCreate
just db-update
```

The API applies pending migrations on startup by default (`Database__AutoMigrate=true`). Docker Compose maps `AUTO_MIGRATE` from `.env` to that canonical ASP.NET key. Startup retry applies only to transient connectivity/startup errors; schema/migration errors fail fast.

## Docker and just

```bash
just docker-up-d
just docker-up-d api db
just docker-logs api
just docker-stop api db
just docker-restart api
just docker-clean
```

`docker-clean` intentionally resets the full development stack including named volumes.

## CI / generated-combination smoke tests

Repository CI generates and builds representative combinations including:

- .NET 8 SQL Server backend
- .NET 9 default backend
- filter-disabled backend
- React full stack with PostgreSQL + Redis + MinIO + Gemini + LHS filtering + Docker
- Angular with PostgreSQL + MinIO + LHS filtering

Guards reject legacy Todo starter artifacts, filter infrastructure when filtering is disabled, backend `.env` alias leakage, and cache dependencies inside Orders/Dashboard/Reports.

## Git

`dotnet new jv-api` runs `git init -b main` as a template post-action. `.gitignore` is included.

## Pack

```bash
dotnet pack JV.ProjectTemplates.csproj -c Release
dotnet new install ./bin/Release/JohnVo.ProjectTemplates.1.8.9.nupkg
```
