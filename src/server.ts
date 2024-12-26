import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { startWhatsAppBot, getLatestQR } from './services/index';
import message from './routes/messages';
import { WebSocketServer } from 'ws';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const wsPort = Number(process.env.WS_PORT) || 8098; 

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});

app.get('/api/whatsapp-qr', (req: Request, res: Response) => {
    const qrCode = getLatestQR();
    if (qrCode) {
        res.json({ qrCode });
    } else {
        res.status(404).json({ error: 'QR code not available yet' });
    }
});

// Routes for messaging
app.use('/api/message', message);

// Start WhatsApp bot
startWhatsAppBot()
    .then(() => {
        console.log('WhatsApp bot started successfully');
    })
    .catch((err) => {
        console.error('Failed to start WhatsApp bot:', err);
    });

const wss = new WebSocketServer({ port : wsPort });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    const sendQrCode = () => {
        const qrCode = getLatestQR(); 
        if (qrCode) {
            ws.send(JSON.stringify({ qrCode }));
        }
    };

    setInterval(sendQrCode, 10000); 

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});


console.log(`[server]: WebSocket server is running at ws://localhost:${wsPort}`);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
