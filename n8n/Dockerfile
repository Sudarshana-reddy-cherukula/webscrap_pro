FROM n8nio/n8n:latest

ENV GENERIC_TIMEZONE=UTC
ENV N8N_PORT=5678
ENV N8N_PROTOCOL=https
ENV N8N_SECURE_COOKIE=false

EXPOSE 5678

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5678/healthz || exit 1

USER node
CMD ["n8n", "start"]
