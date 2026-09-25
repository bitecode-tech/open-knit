# syntax=docker/dockerfile:1.10

FROM node:22-alpine3.20 AS builder
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=open-knit-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY . .
RUN pnpm run build

FROM node:22-alpine3.20 AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g serve
COPY --from=builder /app/dist .
EXPOSE 3000

CMD ["serve", "-s", "/app", "-l", "3000"]
