# Build static site, then serve with unprivileged nginx (K8s-friendly).
# Usage:
#   docker build -t gfn-checker-site .
#   docker build --build-arg VITE_SITE_ORIGIN=https://example.com -t gfn-checker-site .
#   docker run --rm -p 8080:8080 gfn-checker-site

# ---------- build ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js eslint.config.js ./
COPY public ./public
COPY src ./src

# Optional absolute origin for SEO (canonical, Open Graph, sitemap)
ARG VITE_SITE_ORIGIN=
ENV VITE_SITE_ORIGIN=$VITE_SITE_ORIGIN

RUN npm run build

# ---------- runtime ----------
# Non-root nginx on 8080 — avoids chown/bind failures under restricted securityContext
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Drop default site config (image may ship one listening on 8080)
USER root
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/site.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Ensure html is world-readable by the nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
