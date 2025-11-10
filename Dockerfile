FROM node:20-alpine AS base
WORKDIR /app

# Install backend dependencies (use root context paths)
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend ./backend

WORKDIR /app/backend

ENV NODE_ENV=production
# Render injects PORT at runtime
ENV PORT=4000

EXPOSE 4000
CMD ["node", "server.js"]


