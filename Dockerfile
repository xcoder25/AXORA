# ==========================================
# Stage 1: Build & Compile Extensions
# ==========================================
FROM python:3.10-slim AS builder

WORKDIR /app

# Install build tools needed ONLY for compiling certain python wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies to a local user directory to easily copy them later
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --user -r requirements.txt


# ==========================================
# Stage 2: Final Lightweight Runtime
# ==========================================
FROM python:3.10-slim AS runtime

WORKDIR /app

# Install ONLY the absolute runtime dependencies needed for OpenCV, YOLO, and FFmpeg
# Note: build-essential is omitted here, saving hundreds of MBs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy the pre-installed python packages from the builder stage
COPY --from=builder /root/.local /root/.local
COPY . .

# Ensure the system path looks at the copied packages
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
