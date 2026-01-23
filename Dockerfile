# ===========================================
# MyCabas - Dockerfile Multi-stage
# Compatible Vercel & VPS (Hostinger)
# ===========================================

# -----------------------------------------
# Stage 1: Dependencies
# -----------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Installation des dépendances
RUN npm ci

# -----------------------------------------
# Stage 2: Builder
# -----------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copie des dépendances installées
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Génération du client Prisma
RUN npx prisma generate

# Build de l'application Next.js
RUN npm run build

# -----------------------------------------
# Stage 3: Runner (Production)
# -----------------------------------------
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie des fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copie du build Next.js (standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copie du node_modules pour Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
