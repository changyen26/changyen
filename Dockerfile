# Use Python base image for simplicity
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies (including Node.js)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        default-libmysqlclient-dev \
        pkg-config \
        curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY portfolio-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY portfolio-backend/ ./

# Copy frontend code and build
COPY portfolio-frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm ci
RUN npm run build

# Create frontend_build directory and copy built files
WORKDIR /app
RUN mkdir -p ./frontend_build
RUN cp -r ./frontend/.next/standalone/* ./frontend_build/
RUN cp -r ./frontend/.next/static ./frontend_build/.next/
RUN cp -r ./frontend/public ./frontend_build/

# Clean up frontend source to save space
RUN rm -rf ./frontend

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "run.py"]