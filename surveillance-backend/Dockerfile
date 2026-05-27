# Stage 1: Build dependencies
FROM python:3.10-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Inside the subfolder context, requirements.txt is right here
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

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

# Expose port 8000 to match your docker-compose.yml port mapping
EXPOSE 8000

CMD ["python", "main.py"]
