# Stage 1: Build the Web Mini App
FROM node:22-alpine AS web-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# Stage 2: Build the Backend Server
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# Stage 3: Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy compiled artifacts
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=web-builder /app/web/dist ./web/dist

# Create volume mount directory for SQLite
RUN mkdir -p /data
ENV DATABASE_PATH=/data/restpocket.db

EXPOSE 8080

CMD ["node", "server/dist/index.js"]
