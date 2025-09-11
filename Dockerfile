# Multi-stage build for combined frontend + backend deployment

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy frontend package files
COPY portfolio-frontend/package.json portfolio-frontend/package-lock.json* ./
RUN npm ci

# Copy frontend source and build
COPY portfolio-frontend/ ./
RUN npm run build

# Stage 2: Python Backend with Frontend
FROM python:3.11-slim AS production
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        default-libmysqlclient-dev \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY portfolio-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY portfolio-backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/.next/standalone ./frontend_build/
COPY --from=frontend-builder /app/.next/static ./frontend_build/.next/static/
COPY --from=frontend-builder /app/public ./frontend_build/public/

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "run.py"]