FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

# Copy package files and prisma schema first for caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (postinstall runs prisma generate)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript only (prisma generate already ran in postinstall)
RUN npx tsc -b

# Production stage
FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Copy built files and dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
# Required at runtime for env-key validation
COPY --from=builder /app/.env.sample ./.env.sample

EXPOSE 3001

CMD ["npm", "start"]

