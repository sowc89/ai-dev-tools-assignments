#!/bin/sh

# Substitute variables in Nginx config template
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start backend
cd /app/backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# Start Nginx in foreground
nginx -g "daemon off;"
