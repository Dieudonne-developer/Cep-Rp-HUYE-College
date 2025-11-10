FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Environment
ENV NODE_ENV=production
# Render provides PORT at runtime
ENV PORT=4000

# Create uploads directory at runtime
RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "server.js"]

# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "server.js"]



