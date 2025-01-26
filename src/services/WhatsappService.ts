import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { notifyUser } from '../websocket';
import { WebSocket } from 'ws';

interface SessionInfo {
    id: string;
    status: 'pending' | 'connected' | 'expired';
    createdAt: number;
    lastActivity: number;
    socket: ReturnType<typeof makeWASocket> | null;
    qrCode: string | null;
}

export class WhatsAppService {
    private static instance: WhatsAppService;
    private sessions: Map<string, SessionInfo> = new Map();
    private readonly AUTH_BASE_DIR = './auth';

    private constructor() {
        this.initializeService();
    }

    public static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    private async initializeService(): Promise<void> {
        await fs.promises.mkdir(this.AUTH_BASE_DIR, { recursive: true });
        await this.restoreSessions();
    }

    private async restoreSessions(): Promise<void> {
        try {
            const dirs = await fs.promises.readdir(this.AUTH_BASE_DIR);
            for (const sessionId of dirs) {
                if ((await fs.promises.stat(path.join(this.AUTH_BASE_DIR, sessionId))).isDirectory()) {
                    await this.connectExistingSession(sessionId);
                }
            }
        } catch (error) {
            console.error('Error restoring sessions:', error);
        }
    }

    private async connectExistingSession(sessionId: string): Promise<void> {
        const session: SessionInfo = {
            id: sessionId,
            status: 'pending',
            createdAt: Date.now(),
            lastActivity: Date.now(),
            socket: null,
            qrCode: null
        };

        try {
            const { state, saveCreds } = await useMultiFileAuthState(path.join(this.AUTH_BASE_DIR, sessionId));
            const sock = makeWASocket({ auth: state, printQRInTerminal: false });
            session.socket = sock;
            this.sessions.set(sessionId, session);
            this.setupEventListeners(sessionId, sock, saveCreds);
        } catch (error) {
            await this.cleanupSession(sessionId);
        }
    }

    async generateSession(ws: WebSocket | null = null): Promise<{ sessionId: string, qrCode: string }> {
        const sessionId = uuidv4();
        const sessionPath = path.join(this.AUTH_BASE_DIR, sessionId);
        const tempAuthState = await useMultiFileAuthState(path.join(this.AUTH_BASE_DIR, sessionId));

        const session: SessionInfo = {
            id: sessionId,
            status: 'pending',
            createdAt: Date.now(),
            lastActivity: Date.now(),
            socket: null,
            qrCode: null
        };

        this.sessions.set(sessionId, session);

        return new Promise(async (resolve, reject) => {
            try {
                const sock = makeWASocket({
                    auth: tempAuthState.state,
                    printQRInTerminal: true
                });

                session.socket = sock;
                let previousQR: string | null = null;

                sock.ev.on('creds.update', tempAuthState.saveCreds);
                const connectionHandler = async (update: any) => {
                    const { connection, qr } = update;

                    if (qr) {
                        session.qrCode = await QRCode.toDataURL(qr);
                        resolve({ sessionId, qrCode: session.qrCode });
                    }

                    if (connection === 'open') {
                        session.status = 'connected';
                        this.setupEventListeners(sessionId, sock, tempAuthState.saveCreds);
                    } else if (connection === 'close') {
                        await this.handleDisconnect(sessionId, update);
                    }
                };

                sock.ev.on('connection.update', connectionHandler);
                // setTimeout(() => this.cleanupIfUnused(sessionId, sessionPath), 30000);


            } catch (error) {
                await this.cleanupSession(sessionId);
                reject(error);
            }
        });
    }

    private async handleExpiredSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (session?.socket) {
            session.socket.end(new Error('Session expired'));
            session.socket.ev.removeAllListeners('connection.update');
            session.socket.ev.removeAllListeners('creds.update');
            session.socket.ev.removeAllListeners('messages.upsert');
        }
        await this.cleanupSession(sessionId);
    }

    private async handleDisconnect(sessionId: string, update: any): Promise<void> {
        const error = (update.lastDisconnect?.error as Boom)?.output?.statusCode;

        console.log('Disconnected from WhatsApp', error);
        const shouldReconnect = error !== DisconnectReason.loggedOut;

        console.log('Reconnecting', shouldReconnect);

        if (!shouldReconnect) {
            await this.cleanupSession(sessionId);
        } else {
            const session = this.sessions.get(sessionId);
            console.log('Session', session);
            if (session) {
                session.status = 'pending';
                await this.connectExistingSession(sessionId);
            }
        }
    }

    private async cleanupSession(sessionId: string) {
        const sessionPath = path.join(this.AUTH_BASE_DIR, sessionId);
    
        // Remove session from memory
        this.sessions.delete(sessionId);
    
        try {
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true });
                console.log(`Deleted session folder: ${sessionPath}`);
            }
        } catch (error) {
            console.error(`Failed to delete session ${sessionId}:`, error);
        }
    }
    

    private async cleanupIfUnused(sessionId: string, sessionPath: string) {
        const session = this.sessions.get(sessionId);
        if (session && session.status === 'pending') {
            console.log(`Cleaning up unused session: ${sessionId}`);
            await this.cleanupSession(sessionId);
        }
    }

    private setupEventListeners(
        sessionId: string,
        sock: ReturnType<typeof makeWASocket>,
        saveCreds: () => Promise<void>
    ): void {
        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut

                if (shouldReconnect) {
                    console.log(`Reconnecting session ${sessionId}...`);
                    await this.connectExistingSession(sessionId);
                } else {
                    console.log(`Session ${sessionId} closed permanently. Status: ${statusCode}`);
                    await this.cleanupSession(sessionId);
                }
            }
            if (connection === 'open') {
                const session = this.sessions.get(sessionId);
                if (session) {
                    session.status = 'connected';
                }
            }
        });

        sock.ev.on('messages.upsert', async (msg) => {
            const message = msg.messages[0];
            if (!message.message || message.key.fromMe) return;

            const from = message.key.remoteJid;
            if (!from) return;
            console.log('user: ', sock.user);
            console.log('msg: ', message.key);



            // await handleAutoReply(sock, message);
            if (!sock.user || !sock.user.id) {
                console.error('Invalid sock.user or sock.user.id');
                return;
            }
            console.log(sessionId, "   ,,,..........")

            const phoneNumber = sock.user.id.split('@')[0];

            // Send only the phone number in notifyUser

            notifyUser(sessionId, msg.messages);

        });
    }

    async sendMessage(sessionId: string, phoneNumber: string, message: string): Promise<void> {
        try {
            const session = this.sessions.get(sessionId);
            if (!session?.socket) {
                throw new Error('Session not found');
            }
            const formattedNumber = phoneNumber.replace(/[^0-9]/g, '')
            const fullNumber = formattedNumber.startsWith('91') ?
                formattedNumber : `91${formattedNumber}`
            const jid = `${fullNumber}@s.whatsapp.net`
            session.socket.sendMessage(
                jid,
                {
                    text: message
                }
            );
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    async getSessionStatus(sessionId: string): Promise<{
        status: string;
        error?: string;
    }> {
        let session = this.sessions.get(sessionId);

        if (!session) {
            if (existsSync(path.join(this.AUTH_BASE_DIR, sessionId))) {
                try {
                    await this.connectExistingSession(sessionId);
                    session = this.sessions.get(sessionId);
                } catch (error) {
                    return { status: 'error', error: 'Failed to restore session' };
                }
            } else {
                return { status: 'not_found_or_expired', error: 'Session not found/Expired' };
            }
        }

        try {
            if (session?.socket) {
                session.lastActivity = Date.now();
                return { status: session.status };
            } else {
                await this.cleanupSession(sessionId);
                return { status: 'error', error: 'Socket not initialized' };
            }
        } catch (error) {
            await this.cleanupSession(sessionId);
            return { status: 'error', error: 'Connection failed' };
        }
    }
}