import { WebSocket } from "ws";

type Client = {
    sessionId: string;
    websocket: WebSocket;
}

export class ClientManager {
    private clients: Map<string, Client> = new Map();

    public sendMessage(client: Client, message: string) {
        this.clients.set(client.sessionId, client);
    }

    public addClient(client: Client) {
        this.clients.set(client.sessionId, client);
    }

    public removeClient(client: Client) {
        this.clients.delete(client.sessionId);
    }

    public getClient(id: string): Client | undefined {
        return this.clients.get(id);
    }

    public getAllClients(): Client[] {
        return Array.from(this.clients.values());
    }
}