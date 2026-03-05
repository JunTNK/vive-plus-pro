# ===========================================
# VIVE PLUS PRO - Dockerfile Multi-Stage
# Optimizado para producción con Next.js 16
# ===========================================

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat openssl

# Copiar archivos de dependencias
COPY package.json bun.lockb* package-lock.json* yarn.lock* ./
COPY prisma ./prisma/

# Instalar dependencias con bun (más rápido)
RUN npm install -g bun
RUN bun install --frozen-lockfile

# Generar Prisma Client
RUN npx prisma generate

# ===========================================
# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_BUILD_ID=production

# Construir la aplicación
RUN npm run build

# ===========================================
# Stage 3: Runner (Producción)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar base de datos SQLite si existe
COPY --from=builder /app/db ./db

# Crear directorio para uploads
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db

# Cambiar propiedad de archivos
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando de inicio
CMD ["node", "server.js"]
