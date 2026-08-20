# --- base: shared build tools (bcrypt needs to compile a native addon) ---
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

# --- deps: install once, reused by both build and runtime ---
FROM base AS deps
COPY package*.json ./
RUN npm ci

# --- build: generate the Prisma client and compile TypeScript ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# --- runtime ---
FROM base AS runtime
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "dist/server.js"]
