
# syntax=docker/dockerfile:1.7

# --- Stage 1 : deps ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit

# --- Stage 2 : build ---
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Les PUBLIC_* sont embarqués au build ; les secrets restent runtime-only.
ARG PUBLIC_ENV=production
ARG PUBLIC_SITE_URL
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_APP_VERSION
ENV PUBLIC_ENV=$PUBLIC_ENV \
    PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL \
    PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY \
    PUBLIC_APP_VERSION=$PUBLIC_APP_VERSION
RUN npm run build

# --- Stage 3 : runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321
RUN addgroup -S astro && adduser -S astro -G astro
COPY --from=build --chown=astro:astro /app/package.json ./package.json
COPY --from=build --chown=astro:astro /app/node_modules ./node_modules
COPY --from=build --chown=astro:astro /app/dist ./dist
COPY --from=build --chown=astro:astro /app/src/data ./src/data
USER astro
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4321/ || exit 1
CMD ["node", "./dist/server/entry.mjs"]
