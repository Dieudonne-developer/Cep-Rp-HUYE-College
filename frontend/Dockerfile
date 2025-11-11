# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build the application
# VITE_API_BASE_URL should be set as build arg from Render
# Accept it as build arg and set as env var for Vite build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Debug: Print the API URL being used
RUN echo "Building with VITE_API_BASE_URL=$VITE_API_BASE_URL"

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Install only production dependencies (including express for server)
RUN npm install --omit=dev

# Copy built files from build stage
COPY --from=build /app/dist ./dist
# Copy server file
COPY server.js ./

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]
