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
app.use('/api/v1/doc', serve, setup(swaggerFile));


// Routes for messaging
app.use('/api/v1/message', message);
app.use('/api/v1/qr', qrRoute);
app.use('/api/v1/subscribe', notificationRoute);


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
