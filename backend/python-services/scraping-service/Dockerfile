FROM python:3.11-slim AS base
WORKDIR /app

FROM base AS deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS production
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app
USER appuser

COPY --chown=appuser:appgroup . .

ENV PORT=8001
ENV DISPLAY=
EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:8001", "--workers", "2", "--timeout", "120", "app:app"]
