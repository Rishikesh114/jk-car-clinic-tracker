# Use official Node.js LTS Alpine image for lightweight footprint
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first for efficient layer caching
COPY package*.json ./

# Install production dependencies (using modern npm syntax)
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Create directory for persistent SQLite database
RUN mkdir -p /app/data

# Expose server port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV DB_PATH=/app/data/carclinic.db

# Start the application
CMD ["node", "server.js"]