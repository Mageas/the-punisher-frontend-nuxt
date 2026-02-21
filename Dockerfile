# Stage 1: Build
FROM oven/bun:1.3 as builder

WORKDIR /src

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build

# Stage 2: Runtime
FROM oven/bun:1.3-slim as runner

WORKDIR /app

# Copy output from builder
COPY --from=builder /src/.output ./

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Start the application
CMD ["bun", "server/index.mjs"]
