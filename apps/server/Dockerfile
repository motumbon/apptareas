FROM node:18-alpine AS base
WORKDIR /app

# Copiar sólo server para construir imagen independiente
COPY package.json pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/tsconfig.json ./apps/server/
COPY apps/server/prisma ./apps/server/prisma

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@8.15.8 --activate

# Instalar dependencias del server
WORKDIR /app/apps/server
RUN pnpm install --frozen-lockfile || pnpm install

# Copiar el código
COPY apps/server/src ./src

# Build
RUN pnpm build

# Runtime
FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=base /app/apps/server/node_modules ./node_modules
COPY --from=base /app/apps/server/dist ./dist
COPY --from=base /app/apps/server/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/index.js"]
