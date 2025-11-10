# Multi-stage build: build with Node, serve with Nginx
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
# Build uses VITE_API_BASE_URL at build time; set via --build-arg or .env before building
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
# Minimal nginx config is fine for SPA; default.conf already serves static
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


