#!/bin/bash
echo "Starting services..."
npx ts-node src/server.ts & npx ts-node src/websocket.ts & wait

echo "Servers are running!"
