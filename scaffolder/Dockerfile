# syntax=docker/dockerfile:1.7
FROM node:25-alpine3.22 AS build
RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
RUN --mount=type=bind,source=.env,target=/tmp/local.env,required=false \
    if [ -f /tmp/local.env ]; then cp /tmp/local.env /app/.env; fi
COPY tsconfig.json ./
COPY src ./src
RUN pnpm exec tsc -p tsconfig.json

WORKDIR /app/ui
COPY ui/package.json ./
RUN pnpm install --no-frozen-lockfile
COPY ui ./ 
RUN pnpm run build
RUN pnpm run build:server

FROM node:25-alpine3.22 AS runner
RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile
RUN --mount=type=bind,source=.env,target=/tmp/local.env,required=false \
    if [ -f /tmp/local.env ]; then cp /tmp/local.env /app/.env; fi
COPY --from=build /app/dist ./dist
COPY --from=build /app/ui/dist ./ui/dist
RUN mkdir -p /app/output

WORKDIR /app/ui
COPY ui/package.json ./
RUN pnpm install --prod --no-frozen-lockfile

WORKDIR /app
EXPOSE 3000
CMD ["node", "dist/launcher.js"]
