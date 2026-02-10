FROM node:21-alpine3.20 AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:21-alpine3.20 AS runner
WORKDIR /app

RUN npm install -g serve
COPY --from=builder /app/dist .
EXPOSE 8080

CMD ["serve", "-s", "/app", "-l", "8080"]
