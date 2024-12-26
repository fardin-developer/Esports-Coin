import { Router } from 'express';
import { notificationEmitter } from '../services/notification';

const router = Router();

// Subscribe to new message notifications
router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    console.log('SSE connection established.');

    const onMessage = (message: any) => {
        res.write(`data: ${JSON.stringify(message)}\n\n`);
    };

    notificationEmitter.on('newMessage', onMessage);

    req.on('close', () => {
        console.log('SSE connection closed.');
        notificationEmitter.off('newMessage', onMessage);
    });
});

export default router;
