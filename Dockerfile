# Multi-stage Dockerfile for SpheraX services
# Supports building and running any service with SERVICE_NAME build argument

ARG SERVICE_NAME=iam-service

FROM node:24-alpine AS builder

ARG SERVICE_NAME

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY eslint.config.mjs prettier.config.cjs ./

# Copy source files
COPY apps ./apps
COPY libs ./libs

# Install dependencies and build only the selected service
RUN npm ci
RUN npx nest build ${SERVICE_NAME}

# Production stage
FROM node:24-alpine

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}
ENV SERVICE_HTTP_PORT=3001

WORKDIR /app

# Copy only required production files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist/apps/${SERVICE_NAME} ./dist

# Copy proto files (resolved at runtime relative to cwd)
COPY libs/proto/src/*.proto ./libs/proto/src/

# Run as non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); const port = process.env.SERVICE_HTTP_PORT || '3001'; const req = http.get({ host: '127.0.0.1', port, path: '/health', timeout: 2000 }, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('timeout', () => req.destroy()); req.on('error', () => process.exit(1));"

# Expose ports (HTTP for REST, gRPC as needed)
EXPOSE 3001 3002 50051 50052

# Start the service
CMD ["node", "dist/main.js"]


