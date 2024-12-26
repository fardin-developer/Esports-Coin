import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import { handleAutoReply } from './autoReply';
import { notifyNewMessage } from './notification';

let sockValue: ReturnType<typeof makeWASocket> | null = null;
let latestQR: string | null = null; // Variable to store the latest QR code
const qrCodeListeners: ((qrCode: string | null) => void)[] = []; // Listeners for QR code updates

export async function startWhatsAppBot(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal:true
    });
    sockValue = sock;

    sock.ev.on('creds.update', saveCreds);

    //listen to messages
    sock.ev.on('messages.upsert', async (msg) => {
        const message = msg.messages[0];
        if (!message.message || message.key.fromMe) return;

        const from = message.key.remoteJid; // Sender's WhatsApp ID
        if (!from) {
            console.error('Received message without a remoteJid. Ignoring.');
            return;
        }

        await handleAutoReply(sock, message);
        notifyNewMessage(message);
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr) {
            try {
                latestQR = await QRCode.toDataURL(qr); // Store the latest QR code
                notifyQRCodeListeners(latestQR); // Notify listeners
                console.log('Generated QR Code URL');
            } catch (err) {
                console.error('Error generating QR code:', err);
            }
        }

        if (connection === 'close') {
            const error = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = error !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) startWhatsAppBot();
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp!');
        }
    });
}

// Function to get the latest QR code
export function getLatestQR(): string | null {
    return latestQR;
}

// Notify all listeners about QR code updates
function notifyQRCodeListeners(qrCode: string | null) {
    qrCodeListeners.forEach((listener) => listener(qrCode));
}

// Subscribe to QR code updates

export function getWhatsAppSocket() {
    if (!sockValue) {
        throw new Error('WhatsApp bot is not initialized yet');
    }
    return sockValue;
}
