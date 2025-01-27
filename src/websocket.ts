// import WebSocket from 'ws';
// import { Server } from 'http';
// import { parse } from 'url';
// import { WhatsAppService } from './services/WhatsappService';
// import { ClientManager } from './ClientManager';
// import { v4 as uuidv4 } from 'uuid';

// const userSockets: Map<string, WebSocket> = new Map();



// export function setupWebSocket(server: Server) {
//     const wss = new WebSocket.Server({ server });


    


//     wss.on('connection', async (ws, req) => {
//         const whatsappService = WhatsAppService.getInstance();
//         const clientManager = ClientManager.getInstance();
//         const sessionId = uuidv4();
//         console.log('WebSocket connection established.');

//         // Parse the query string from the URL
//         const parsedUrl = parse(req.url || '', true);
//         const userId = parsedUrl.query.userId as string;
//         const getQr = parsedUrl.query.getQr;

//         // Check if `getQr` is requested
//         if (getQr) {
//             try {
//                 console.log('Generating QR session...');
//                 clientManager.addClient(sessionId, ws);
//                 clientManager.sendQr(sessionId);
//             } catch (error) {
//                 console.error('Error generating QR session:', error);
//                 ws.close(1011, 'Failed to generate QR session'); // Internal server error
//                 return;
//             }
//         }

//         // Check if `userId` is provided
//         if (userId) {
//             console.log(`User connected: ${userId}`);

//             // Save the userId and WebSocket connection in the map
//             userSockets.set(userId, ws);

//             // Handle WebSocket events
//             ws.on('close', (code, reason) => {
//                 console.log(`Connection closed for user ${userId}: Code=${code}, Reason=${reason}`);
//                 userSockets.delete(userId); // Remove from the map
//             });

//             ws.on('error', (error) => {
//                 console.error(`WebSocket error for user ${userId}:`, error);
//                 userSockets.delete(userId); // Remove from the map on error
//             });
//         }

//         // If neither `getQr` nor `userId` is valid, close the connection
//         if (!getQr && !userId) {
//             console.warn('Neither getQr nor userId provided in the connection URL.');
//             ws.close(1008, 'Invalid connection parameters'); // Policy Violation
//         }
//     });

//     // Graceful shutdown
//     process.on('SIGINT', () => {
//         console.log('Shutting down WebSocket server...');
//         wss.clients.forEach(client => client.close());
//         wss.close(() => {
//             console.log('WebSocket server closed.');
//             process.exit(0);
//         });
//     });
// }



// // Function to notify user of new messages
// export function notifyUser(userId: string, messages: Record<string, any>) {
//     const ws = userSockets.get(userId);
//     if (!ws || ws.readyState !== WebSocket.OPEN) {
//         console.log(`No active WebSocket for user ${userId}`);
//         return;
//     }
//     console.log(`Notifying user ${userId}`);
//     ws.send(JSON.stringify({ type: 'NEW_MESSAGE', data: messages }));
// }
