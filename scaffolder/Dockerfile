FROM node:25-alpine3.22 AS build
RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

WORKDIR /app/ui
COPY ui/package.json ./
RUN pnpm install --no-frozen-lockfile
COPY ui ./ 
RUN pnpm run build
RUN pnpm run build:server

FROM node:25-alpine3.22 AS runner
RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
COPY --from=build /app/output ./output
COPY --from=build /app/ui/dist ./ui/dist

WORKDIR /app/ui
COPY ui/package.json ./
RUN pnpm install --prod --no-frozen-lockfile

WORKDIR /app
EXPOSE 3000
CMD ["node", "dist/launcher.js"]
