# Imagen de producción/test para Coolify (Next.js standalone).
# Build: docker build -t inglobal-site .
# Runtime: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, S3_*, STORAGE_PUBLIC_URL, CRON_SECRET, RESEND_*
FROM public.ecr.aws/docker/library/node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM public.ecr.aws/docker/library/node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# STORAGE_PUBLIC_URL entra en la config de imágenes y CSP en build: pasarlo como build arg.
ARG STORAGE_PUBLIC_URL
ENV STORAGE_PUBLIC_URL=$STORAGE_PUBLIC_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Herramientas de migración de datos (importar-prod / verificar-paridad). No es la imagen de runtime:
# docker build --target tools ...  (el compose la usa con el perfil `migracion`).
FROM build AS tools
ENV NODE_ENV=development
CMD ["npx", "tsx", "scripts/migracion/importar-prod.ts"]

FROM public.ecr.aws/docker/library/node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
# Migraciones: instrumentation.ts las aplica al arrancar (carpeta drizzle/ en runtime).
COPY --from=build --chown=app:app /app/drizzle ./drizzle
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
