# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=/
RUN npm run build

# Stage 2: Final Runtime
FROM python:3.12-slim

# Install Nginx and gettext (for envsubst)
RUN apt-get update && apt-get install -y \
    nginx \
    gettext \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy frontend build from stage 1
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy Nginx config and start script
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Default port for Render
ENV PORT=10000

# Start both Nginx and FastAPI
CMD ["./start.sh"]
