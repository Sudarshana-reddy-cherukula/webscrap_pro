FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

FROM base AS dev-deps
RUN npm ci

FROM base AS build
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

FROM mcr.microsoft.com/playwright:v1.49.0-noble AS playwright-base

FROM playwright-base AS production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./
COPY --from=build /app/src ./src

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    mkdir -p /app/uploads /app/exports /app/reports && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
