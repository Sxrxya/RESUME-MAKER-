FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install OS library required by Playwright's bundled Node driver, then Python deps + Chromium
RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && playwright install --with-deps chromium

# Copy backend, config, templates, and support files
COPY backend ./backend
COPY config ./config
COPY frontend ./frontend
COPY templates ./templates
COPY app.py main.py ./

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.api_server:app --host 0.0.0.0 --port ${PORT:-8000}"]
