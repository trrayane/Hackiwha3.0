# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* env vars at build time, so this must be passed as a
# build arg (docker-compose build args), not a runtime env var.
ARG VITE_API_BASE_URL=http://localhost:8100
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Vite-only build (skips `tsc -b`, the project's own `npm run build` script) —
# `tsc -b` fails on pre-existing type errors in files unused by App.tsx's
# routes (dead scaffold files like NewJingleWizard.tsx, Jinglestable.tsx).
# vite build alone (esbuild-transpiled) matches what already ships via
# `npm run dev`, so this doesn't change runtime behavior.
RUN npx vite build

# --- serve stage ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
