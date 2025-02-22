import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { serve, setup } from 'swagger-ui-express';
import swaggerFile from './doc/swagger-output.json';
import connectDB from './db/connectDB';
import setupRoutes from './routes';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get('/test', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

// Swagger Documentation
app.use('/api/v1/doc', serve, setup(swaggerFile));

setupRoutes(app);

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URL = process.env.MONGO_URL || '';

const start = async () => {
  try {
    await connectDB(MONGO_URL);
    server.listen(PORT, () =>
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
};

start();
