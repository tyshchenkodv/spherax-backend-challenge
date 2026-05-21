# SpheraX Backend Challenge

NestJS monorepo backend challenge for two independent services with REST, Swagger, private gRPC APIs, shared libraries, reusable API versioning, Docker, and unit/integration/e2e test coverage.

## Architecture Overview

- **`iam-service`**: User management service
  - REST API: CRUD operations on users
  - gRPC API: User lookup and validation for other services
  - In-memory storage with seeded test users
- **`notify-service`**: Notification service
  - REST API: CRUD operations on notifications
  - gRPC API: Notification management
  - Calls `iam-service` over gRPC to validate notification recipients before creation
  - Rejects notifications for disabled or missing users

- **Shared Libraries**: Common code reused by both services
  - `@lib/api-versioning`: API version header parsing, validation, decorators, and Swagger integration
  - `@lib/common`: Domain errors, error codes, and HTTP exception filter
  - `@lib/config`: Configuration validation using class-validator
  - `@lib/grpc`: gRPC client factory and error mapping
  - `@lib/proto`: Shared `.proto` definitions and path constants

## Project Structure

```text
apps/
  iam-service/
    src/
      main.ts                          # IAM service bootstrap
      app/                             # Root module & config
      health/                          # Health check endpoint
      users/                           # User management
        controllers/                   # REST and gRPC controllers
        dto/                           # DTOs for REST API
        enums/                         # Status enums
        mappers/                       # Response mappers (v1/v2)
        repositories/                  # Data persistence layer
        services/                      # Business logic
        interfaces/                    # Domain/service contracts
        types/                         # Response shape types
    test/
      users.e2e-spec.ts               # REST API versioning tests
      users.grpc.integration-spec.ts  # gRPC integration tests
  notify-service/
    src/
      main.ts                          # Notify service bootstrap
      app/                             # Root module & config
      health/                          # Health check endpoint
      iam-client/                      # gRPC client to IAM service
      notifications/                   # Notification management
        controllers/                   # REST and gRPC controllers
        dto/                           # DTOs for REST API
        enums/                         # Status/channel enums
        mappers/                       # Response mappers (v1/v2)
        repositories/                  # Data persistence layer
        services/                      # Business logic
        interfaces/                    # Domain/service contracts
        types/                         # Response shape types
    test/
      notifications.e2e-spec.ts       # REST API versioning tests
      notifications.grpc.integration-spec.ts # gRPC integration tests

libs/
  api-versioning/                      # REST API versioning
    src/
      constants/                       # Version constants
      decorators/                      # @RequestApiVersion() & @ApiVersionHeader()
      interceptors/                    # Global API version validation
      parsers/                         # Version parsing & validation
  common/                              # Shared errors & filters
    src/
      errors/                          # Domain error classes
      filters/                         # HTTP exception filter
  config/                              # Configuration utilities
    src/
      env.ts                           # Environment variable helpers
      register-as-validated.ts         # Config factory with validation
  grpc/                                # gRPC utilities
    src/
      grpc-client-options.ts           # Client factory
      grpc-error.mapper.ts             # Domain ↔ gRPC error mapping
  proto/                               # Shared proto definitions
    src/
      iam.proto                        # IAM service proto
      notify.proto                     # Notify service proto
      proto-paths.ts                   # Proto path constants

Dockerfile                             # Multi-stage, service-agnostic build
docker-compose.yml                     # Run both services with Docker Compose
.env.example                           # Environment variables template
```

## Requirements Coverage

✅ NestJS CLI monorepo with two independent services  
✅ REST APIs with Swagger/OpenAPI documentation  
✅ Private gRPC APIs for each service  
✅ Service-to-service gRPC communication (notify → iam)  
✅ Shared `.proto` definitions across services  
✅ REST API versioning via `X-SpheraX-Api-Version` header  
✅ Two versioned endpoints (v1: basic, v2: extended)  
✅ One reusable root `Dockerfile` for all services  
✅ Shared code at three levels: global libs, service modules, API mappers  
✅ In-memory data storage  
✅ Unit tests (mappers, parsers)  
✅ Integration tests (gRPC APIs and notify → iam service-to-service flow)  
✅ E2E tests (REST API versioning behavior)  
✅ Environment variables with sensible defaults

## API Versioning

Both services support REST API versioning via the `X-SpheraX-Api-Version` header:

- **Version 1** (default): Basic response fields
- **Version 2**: Extended response with status, timestamps, and additional metadata
- **Unsupported versions**: Return `400 Bad Request` with error code `UNSUPPORTED_API_VERSION`

### Response Shape by Version

**IAM Service — GET /users/:id**

- **v1**: `{ id, email, name }`
- **v2**: `{ id, email, name, status, createdAt, updatedAt }`

**Notify Service — POST /notifications**

- **v1**: `{ id, userId, channel, subject, body }`
- **v2**: `{ id, userId, channel, subject, body, status, createdAt, sentAt }`

## Local Setup

### Prerequisites

- **Node.js**: 24 LTS
- **npm**: 11+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd SpheraX

# Install dependencies from package-lock.json
npm ci
```

### Running Services Locally

#### Run IAM Service

```bash
# Development mode with watch
npm run start:dev:iam

# Production mode
npm run start:iam
```

Service runs on:

- **HTTP REST**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/docs
- **gRPC**: 0.0.0.0:50051

#### Run Notify Service

First, ensure IAM service is running. Then:

```bash
# Development mode with watch
npm run start:dev:notify

# Production mode
npm run start:notify
```

Service runs on:

- **HTTP REST**: http://localhost:3002
- **Swagger Docs**: http://localhost:3002/docs
- **gRPC**: 0.0.0.0:50052

### Building

```bash
# Build both services
npm run build

# Output: dist/apps/iam-service/ and dist/apps/notify-service/
```

### Testing

```bash
# Run unit/controller tests
npm test

# Run gRPC integration tests, including notify → iam service-to-service flow
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run with coverage
npm test -- --coverage
```

### Linting & Formatting

```bash
# Check code quality
npm run lint

# Format code
npm run format
```

## Docker Setup

### Build Images

```bash
# Build both services
docker compose build

# Or build a specific service
docker build --build-arg SERVICE_NAME=iam-service -t spherax-iam-service .
docker build --build-arg SERVICE_NAME=notify-service -t spherax-notify-service .
```

### Run with Docker Compose

```bash
# Start both services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Services will be available at:

- **IAM REST**: http://localhost:3001
- **IAM Swagger**: http://localhost:3001/docs
- **Notify REST**: http://localhost:3002
- **Notify Swagger**: http://localhost:3002/docs

> **Note**: Swagger UI is enabled in all environments for this challenge demonstration.
> In a production deployment, restrict `/docs` to internal networks or disable it entirely.

### Environment Variables (Docker)

The `docker-compose.yml` uses a bridged network so services communicate via hostname:

```yaml
IAM_GRPC_CLIENT_URL: iam-service:50051 # Notify → IAM gRPC
```

For local development without Docker, IAM binds its gRPC server to
`0.0.0.0:50051`, while notify should target it with
`IAM_GRPC_CLIENT_URL=localhost:50051`.

## REST API Examples

### IAM Service

#### Get All Users (v1 — default)

```bash
curl http://localhost:3001/users
```

Response:

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000001",
    "email": "john@example.com",
    "name": "John Doe"
  }
]
```

#### Get All Users (v2 — extended)

```bash
curl -H "X-SpheraX-Api-Version: 2" http://localhost:3001/users
```

Response:

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000001",
    "email": "john@example.com",
    "name": "John Doe",
    "status": "active",
    "createdAt": "2026-05-21T10:00:00.000Z",
    "updatedAt": "2026-05-21T10:00:00.000Z"
  }
]
```

#### Create User

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "name": "Jane Smith",
    "status": "active"
  }'
```

#### Update User Status

```bash
curl -X PATCH http://localhost:3001/users/00000000-0000-4000-8000-000000000001/status \
  -H "Content-Type: application/json" \
  -d '{"status": "disabled"}'
```

#### Health Check

```bash
curl http://localhost:3001/health
```

Response: `{ "status": "ok", "service": "iam-service" }`

### Notify Service

#### Create Notification (v1 — default)

```bash
curl -X POST http://localhost:3002/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-4000-8000-000000000001",
    "channel": "email",
    "subject": "Welcome!",
    "body": "Thank you for signing up."
  }'
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "00000000-0000-4000-8000-000000000001",
  "channel": "email",
  "subject": "Welcome!",
  "body": "Thank you for signing up."
}
```

#### Create Notification (v2 — extended)

```bash
curl -X POST http://localhost:3002/notifications \
  -H "X-SpheraX-Api-Version: 2" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-4000-8000-000000000001",
    "channel": "email",
    "subject": "Welcome!",
    "body": "Thank you for signing up."
  }'
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "00000000-0000-4000-8000-000000000001",
  "channel": "email",
  "subject": "Welcome!",
  "body": "Thank you for signing up.",
  "status": "created",
  "createdAt": "2026-05-21T10:30:45.123Z",
  "sentAt": null
}
```

#### Get All Notifications

```bash
curl http://localhost:3002/notifications
```

#### Get Notification by ID

```bash
curl http://localhost:3002/notifications/{id}
```

#### Get Notifications by User ID

```bash
curl http://localhost:3002/users/00000000-0000-4000-8000-000000000001/notifications
```

#### Delete Notification

```bash
curl -X DELETE http://localhost:3002/notifications/{id}
# Returns 204 No Content
```

#### Attempt Notification for Disabled User

```bash
curl -X POST http://localhost:3002/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "00000000-0000-4000-8000-000000000002",
    "channel": "email",
    "subject": "Hello",
    "body": "Message"
  }'
```

Response: `409 Conflict`

```json
{
  "statusCode": 409,
  "code": "USER_DISABLED",
  "message": "User is disabled: 00000000-0000-4000-8000-000000000002",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-21T10:35:12.456Z",
  "path": "/notifications"
}
```

## gRPC Communication

The notify-service communicates with iam-service over gRPC to validate notification recipients:

1. **Notify REST → Notify Service** (internal HTTP)
2. **Notify Service → IAM Service** (gRPC ValidateNotificationRecipient)
3. **IAM Service validates user status** (in-memory lookup)
4. **Response sent back** (gRPC or error)

This ensures notifications are only created for active users.

### Raw gRPC Example (grpcurl)

```bash
# Install grpcurl: https://github.com/fullstorydev/grpcurl

# Get user by ID from IAM service
grpcurl -plaintext \
  -import-path libs/proto/src \
  -proto iam.proto \
  -d '{"id": "00000000-0000-4000-8000-000000000001"}' \
  localhost:50051 iam.IamService.GetUserById

# Validate notification recipient via IAM service
grpcurl -plaintext \
  -import-path libs/proto/src \
  -proto iam.proto \
  -d '{"userId": "00000000-0000-4000-8000-000000000001"}' \
  localhost:50051 iam.IamService.ValidateNotificationRecipient

# Create notification via Notify gRPC
grpcurl -plaintext \
  -import-path libs/proto/src \
  -proto notify.proto \
  -d '{
    "userId": "00000000-0000-4000-8000-000000000001",
    "channel": "email",
    "subject": "Test",
    "body": "gRPC test"
  }' \
  localhost:50052 notify.NotifyService.CreateNotification
```

## Data

### Seeded Users (IAM Service)

| ID                | Email                | Name          | Status   |
| ----------------- | -------------------- | ------------- | -------- |
| `00000000-0000-4000-8000-000000000001`   | john@example.com     | John Doe      | active   |
| `00000000-0000-4000-8000-000000000002` | disabled@example.com | Disabled User | disabled |

### Notification Channels (Notify Service)

- `email`
- `sms`
- `push`

### Notification Statuses

- `created` (initial)
- `sent` (after delivery)
- `failed` (on error)

## Error Handling

Both services use a global HTTP exception filter that converts domain errors to standardized error responses:

```json
{
  "statusCode": number,
  "code": string,
  "message": string,
  "correlationId": string | undefined,
  "timestamp": string (ISO 8601),
  "path": string
}
```

### Domain Error Codes

| Code                      | HTTP Status | Meaning                                         |
| ------------------------- | ----------- | ----------------------------------------------- |
| `USER_NOT_FOUND`          | 404         | User does not exist                             |
| `USER_DISABLED`           | 409         | User is disabled (cannot receive notifications) |
| `NOTIFICATION_NOT_FOUND`  | 404         | Notification does not exist                     |
| `INVALID_REQUEST`         | 400         | Request validation failed                       |
| `UNSUPPORTED_API_VERSION` | 400         | API version is not supported                    |

### gRPC Error Mapping

Domain errors are mapped to gRPC status codes:

| Error                     | gRPC Status               |
| ------------------------- | ------------------------- |
| `USER_NOT_FOUND`          | `NOT_FOUND` (5)           |
| `USER_DISABLED`           | `FAILED_PRECONDITION` (9) |
| `NOTIFICATION_NOT_FOUND`  | `NOT_FOUND` (5)           |
| `INVALID_REQUEST`         | `INVALID_ARGUMENT` (3)    |
| `UNSUPPORTED_API_VERSION` | `INVALID_ARGUMENT` (3)    |

## Code Quality

### TypeScript

- Strict mode enabled
- Explicit return types on all functions
- No implicit `any`
- Path aliases for clean imports (`@app/*`, `@lib/*`)

### ESLint + Prettier

```bash
npm run lint      # Check code
npm run format    # Auto-format
```

## Contributing

- Keep services independent—share only via gRPC or shared libs
- Add tests for new features (unit + integration/e2e)
- Use domain errors for business logic; HTTP exceptions for infrastructure
- Document API changes in Swagger

## License

MIT
