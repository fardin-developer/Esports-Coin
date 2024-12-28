import WebSocket from 'ws';
import { Server } from 'http';
import { parse } from 'url';

const userSockets: Map<string, WebSocket> = new Map();

export function setupWebSocket(server: Server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        console.log('WebSocket connection established.');

        // Parse user ID from the query string (e.g., ?userId=12345)
        const parsedUrl = parse(req.url || '', true);
        const userId = parsedUrl.query.userId as string;

        if (userId) {
            console.log(`User connected: ${userId}`);
            
            // Save userId and WebSocket connection in the map
            userSockets.set(userId, ws);

            // Handle WebSocket events
            ws.on('close', (code, reason) => {
                console.log(`Connection closed for user ${userId}: Code=${code}, Reason=${reason}`);
                userSockets.delete(userId); // Remove from the map
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for user ${userId}:`, error);
                userSockets.delete(userId); // Remove from the map on error
            });
        } else {
            console.warn('No userId provided in the connection URL.');
            ws.close(1008, 'User ID required'); // Close the connection with an error code
        }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('Shutting down WebSocket server...');
        wss.clients.forEach(client => client.close());
        wss.close(() => {
            console.log('WebSocket server closed.');
            process.exit(0);
        });
    });
}


// Function to notify user of new messages
export function notifyUser(userId: string, messages: Record<string, any>) {
    const ws = userSockets.get(userId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.log(`No active WebSocket for user ${userId}`);
        return;
    }
    console.log(`Notifying user ${userId}`);
    ws.send(JSON.stringify({ type: 'NEW_MESSAGE', data: messages }));
}
