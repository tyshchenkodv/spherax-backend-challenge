# SpheraX Backend Challenge

NestJS monorepo backend challenge for two independent services with REST,
Swagger, private gRPC APIs, shared libraries, reusable API versioning, Docker,
and unit/integration/e2e test coverage.

## Planned Architecture

- `iam-service` owns users and exposes REST CRUD plus private gRPC user lookup.
- `notify-service` owns notifications and calls `iam-service` over gRPC before
  creating a notification.
- Shared libraries provide common errors, configuration, API versioning, gRPC
  setup, and shared proto definitions.
- Data storage is in memory for the challenge scope.

## Planned Structure

```text
apps/
  iam-service/
  notify-service/
libs/
  common/
  config/
  api-versioning/
  grpc/
  proto/
Dockerfile
docker-compose.yml
.env.example
```

## Requirements Covered

- NestJS CLI monorepo
- At least two independent services
- REST APIs with Swagger/OpenAPI
- Private gRPC APIs for each service
- One service-to-service gRPC call
- Shared `.proto` definitions
- REST API versioning through `X-SpheraX-Api-Version`
- One reusable root `Dockerfile`
- Shared code at global, service, and API levels
- Unit, integration, and full cross-service e2e tests

## API Versioning

REST endpoints use the `X-SpheraX-Api-Version` header. Missing headers default
to version `1`; unsupported versions return `400 Bad Request`.

The user lookup endpoint will demonstrate two versions:

- version `1`: basic user response
- version `2`: extended user response

## Local Setup

Implementation commands will be documented here as the project is built. The
final project should be runnable and testable by following only this README.
