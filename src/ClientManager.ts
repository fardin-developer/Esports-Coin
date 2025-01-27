import { WebSocket } from "ws";
import { WhatsAppService } from "./services/WhatsappService"; // Import the WhatsAppService class if it's in a separate file.


// export class ClientManager {
//     private static instance: ClientManager;
//     private clients: Map<string, WebSocket> = new Map();

//     // Singleton instance getter
//     public static getInstance(): ClientManager {
//         if (!ClientManager.instance) {
//             ClientManager.instance = new ClientManager();
//         }
//         return ClientManager.instance;
//     }

//     // Add a client to the manager
//     public addClient(sessionId: string, ws: WebSocket): void {
//         this.clients.set(sessionId, ws);
//     }

//     // Remove a client by session ID
//     public removeClient(sessionId: string): void {
//         this.clients.delete(sessionId);
//     }

//     // Get a client WebSocket by session ID
//     public getClient(sessionId: string): WebSocket | undefined {
//         return this.clients.get(sessionId);
//     }

//     // Get all clients
//     public getAllClients(): { sessionId: string; websocket: WebSocket }[] {
//         return Array.from(this.clients.entries()).map(([sessionId, websocket]) => ({
//             sessionId,
//             websocket,
//         }));
//     }
    

//     // Send a QR code to the client
//     public async sendQr(sessionId: string): Promise<void> {
//         try {
//             const ws = this.getClient(sessionId);
//             if (!ws) throw new Error(`WebSocket not found for session ID: ${sessionId}`);

//             // Generate a new session and QR code
//             const { sessionId: newSessionId, qrCode } = await WhatsAppService.getInstance().generateSession();

//             // Send QR code to the WebSocket client
//             ws.send(JSON.stringify({ sessionId: newSessionId, qr: qrCode }));
//         } catch (error) {
//             console.error('Error sending QR code:', error);
//         }
//     }
// }
