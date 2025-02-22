import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
// import { startWhatsAppBot, getLatestQR } from './services/index';
import notificationRoute from './routes/notifications';
import { serve, setup } from 'swagger-ui-express';
import swaggerFile from './doc/swagger-output.json';
// import { notificationEmitter } from './services/notification';
import connectDB from './db/connectDB';
import http from 'http';
// import { setupWebSocket } from './websocket';
import cors from 'cors'

//IMPORT ROUTES
import message from './routes/messages';
import qrRoute from './routes/qr';
import user from './routes/user'
import webhook from './routes/webhook';
import instanceRoute from './routes/instance'
dotenv.config();

const app: Express = express();

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:3001','http://localhost:3002'], // Allow frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow required headers
  credentials: true // If you use cookies/auth tokens
}));


app.get('/test', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});
app.use('/api/v1/doc', serve, setup(swaggerFile));

// Routes for messaging
app.use('/api/v1/user', user);
app.use('/api/v1/qr', qrRoute);
app.use('/api/v1/instance', instanceRoute);
app.use('/api/v1/webhook', webhook);
app.use('/api/v1/message', message);
app.use('/api/v1/subscribe', notificationRoute);

// Create HTTP server and integrate WebSocket
const server = http.createServer(app);
// setupWebSocket(server);



// Server setup and start
const port = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || ''; 
const start = async () => {
  try {
    await connectDB(MONGO_URL);     
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    ); 
  } catch (error) {
    console.log(error);
  }
};


start();
