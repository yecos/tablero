#!/bin/bash
# Auto-restart server script for DesignAI
# Restarts the Next.js server if it crashes (e.g., due to VLM memory pressure)

cd /home/z/my-project

LOG_FILE="/home/z/my-project/server.log"
MAX_RESTARTS=10
RESTART_COUNT=0
RESTART_DELAY=3

echo "[$(date)] Starting DesignAI server with auto-restart..." >> "$LOG_FILE"

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    echo "[$(date)] Starting server (attempt $((RESTART_COUNT + 1))/$MAX_RESTARTS)..." >> "$LOG_FILE"

    NODE_OPTIONS='--max-old-space-size=2048' npx next start -p 3000 >> "$LOG_FILE" 2>&1
    EXIT_CODE=$?

    echo "[$(date)] Server exited with code $EXIT_CODE" >> "$LOG_FILE"

    if [ $EXIT_CODE -eq 0 ]; then
        echo "[$(date)] Server shut down gracefully" >> "$LOG_FILE"
        break
    fi

    RESTART_COUNT=$((RESTART_COUNT + 1))
    echo "[$(date)] Restarting in ${RESTART_DELAY}s..." >> "$LOG_FILE"
    sleep $RESTART_DELAY
done

echo "[$(date)] Server manager exiting (restarts: $RESTART_COUNT)" >> "$LOG_FILE"
