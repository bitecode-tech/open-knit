# syntax=docker/dockerfile:1.7
FROM node:22-alpine3.22 AS build
RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
RUN --mount=type=bind,source=.,target=/context,readonly \
    if [ -f /context/.env ]; then cp /context/.env /app/.env; fi
COPY tsconfig.json ./
COPY src ./src
RUN pnpm exec tsc -p tsconfig.json

WORKDIR /app/ui
COPY ui ./ 
RUN pnpm install --no-frozen-lockfile
RUN pnpm run build
RUN pnpm run build:server

FROM node:22-alpine3.22 AS runner
RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile
RUN --mount=type=bind,source=.,target=/context,readonly \
    if [ -f /context/.env ]; then cp /context/.env /app/.env; fi
COPY --from=build /app/dist ./dist
COPY --from=build /app/ui/dist ./ui/dist
RUN mkdir -p /app/output

WORKDIR /app/ui
COPY ui ./
RUN pnpm install --prod --no-frozen-lockfile

WORKDIR /app
EXPOSE 3000
CMD ["node", "dist/launcher.js"]
