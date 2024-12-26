import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { startWhatsAppBot, getLatestQR } from './services/index';
import message from './routes/messages';
import qrRoute from './routes/qr'
import notificationRoute from './routes/notifications'
import { WebSocketServer } from 'ws';
import { serve, setup } from 'swagger-ui-express';
import swaggerFile from './doc/swagger-output.json'
import { notificationEmitter } from './services/notification';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const wsPort = Number(process.env.WS_PORT) || 8098; 

app.use(express.json());


app.get('/test', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});


app.use('/doc', serve, setup(swaggerFile));


// Routes for messaging
app.use('/api/message', message);
app.use('/api/whatsapp-qr', qrRoute);
app.use('/api/subscribe', notificationRoute);

// Start WhatsApp bot
startWhatsAppBot()
    .then(() => {
        console.log('Connecting with whatsapp babyyy......');
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
    
    // Listen for new messages and send to client
    const onNewMessage = (message: { from: string; text: string }) => {
        ws.send(JSON.stringify({ type: 'message', data: message }));
    };

    notificationEmitter.on('newMessage', onNewMessage);


    setInterval(sendQrCode, 10000); 

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});


console.log(`[server]: WebSocket server is running at ws://localhost:${wsPort}`);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
