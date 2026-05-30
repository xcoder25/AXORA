# Stage 1: Build dependencies
FROM python:3.10-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Inside the subfolder context, requirements.txt is right here
COPY requirements.txt .
# Ensure uvicorn is installed as the ASGI server
RUN pip install --no-cache-dir --user -r requirements.txt uvicorn[standard]

# Stage 2: Final lightweight runtime
FROM python:3.10-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libglib2.0-0 \
    libgomp1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local

# Copies the backend code directly into /app
COPY . .

ENV PATH=/root/.local/bin:$PATH

# Cloud Run injects PORT (default 8080). We bind uvicorn to it at runtime.
EXPOSE 8080

# Use shell form so $PORT is expanded at container start time
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --log-level info
