#!/bin/sh
cd /home/z/my-project
echo "[$(date)] Starting DesignAI with auto-restart..." > /home/z/my-project/server.log

attempt=0
max_attempts=100

while [ $attempt -lt $max_attempts ]; do
    attempt=$((attempt + 1))
    echo "[$(date)] Starting server (attempt $attempt)..." >> /home/z/my-project/server.log
    
    NODE_OPTIONS='--max-old-space-size=512 --expose-gc' npx next start -p 3000 >> /home/z/my-project/server.log 2>&1
    exit_code=$?
    
    echo "[$(date)] Server exited with code $exit_code" >> /home/z/my-project/server.log
    
    # Clean up temp files
    rm -f /home/z/my-project/upload/temp/analyze_*.jpg 2>/dev/null
    
    # Wait before restarting
    sleep 2
done
