FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads and logs directories
RUN mkdir -p uploads logs

# Environment
ENV NODE_ENV=production
# Railway provides PORT at runtime via environment variable

# Expose port (Railway will map this automatically)
# Railway uses PORT environment variable (typically 3000 or dynamic)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]



