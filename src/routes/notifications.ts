import { Router } from 'express';
import { notificationEmitter } from '../services/notification';

const router = Router();

// Subscribe to new message notifications
router.get('/subscribe', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const onMessage = (message: any) => {
        res.write(`data: ${JSON.stringify(message)}\n\n`);
    };

    notificationEmitter.on('newMessage', onMessage);

    req.on('close', () => {
        notificationEmitter.off('newMessage', onMessage);
    });
});

export default router;
