# DTO Sync Tool - Docker Container
FROM node:18-alpine

# Install required system dependencies
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY generate-dtos.js ./

# Make the script executable
RUN chmod +x generate-dtos.js

# Default command
CMD ["node", "generate-dtos.js"]
