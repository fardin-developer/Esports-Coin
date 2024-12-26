import { Router, Request, Response } from 'express';
import { getWhatsAppSocket } from '../services';
import { proto } from '@whiskeysockets/baileys'; // Importing Baileys types

const router = Router();

// Auto-reply and send message endpoint
router.post('/send', async (req: Request, res: Response) => {
    const { to, message }: { to: string; message: string } = req.body;

    // Validate input
    if (!to || !message) {
        res.status(400).json({ error: 'Both "to" and "message" are required' });
        return;
    }

    try {
        // Ensure `getWhatsAppSocket` returns a valid WhatsApp socket instance
        const sock = getWhatsAppSocket();
        if (!sock) {
            throw new Error('WhatsApp socket is not initialized');
        }

        // Validate and format the recipient JID
        const recipientJID = to.includes('@') ? to : `${to}@s.whatsapp.net`;

        // Send a WhatsApp message
        const result: proto.WebMessageInfo | undefined = await sock.sendMessage(
            recipientJID,
            { text: message } // Message content
        );

        // If result is undefined, handle the error
        if (!result) {
            throw new Error('Message sending failed');
        }

        // Respond with the success status
        res.status(200).json({
            success: true,
            message: `Message sent to ${to}`,
            result,
        });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to send message',
        });
    }
});

let delay = new Promise((res) => {
    setTimeout(() => {
        res
    }, 2000);
})

const del = (ms: number) => {
    new Promise((res) => { setTimeout(() => { res }, ms); })
}


router.post('/send-bulk', async (req: Request, res: Response) => {
    const { messages }: { messages: { to: string; message: string }[] } = req.body;

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'A non-empty array of messages is required' });
        return;
    }

    try {
        // Ensure `getWhatsAppSocket` returns a valid WhatsApp socket instance
        const sock = getWhatsAppSocket();
        if (!sock) {
            throw new Error('WhatsApp socket is not initialized');
        }

        const results = [];
        const errors = [];

        for (const { to, message } of messages) {
            if (!to || !message) {
                errors.push({ to, error: 'Both "to" and "message" are required' });
                continue;
            }

            try {
                // Validate and format the recipient JID
                const recipientJID = to.includes('@') ? to : `${to}@s.whatsapp.net`;


                // 2sec delay
                await new Promise((res) => {
                    setTimeout(res, 2000);
                })

                // Send a WhatsApp message
                const result: proto.WebMessageInfo | undefined = await sock.sendMessage(
                    recipientJID,
                    { text: message }
                );

                // If result is undefined, log the error
                if (!result) {
                    errors.push({ to, error: 'Message sending failed' });
                } else {
                    results.push({ to, success: true, result });
                }
            } catch (error) {
                errors.push({ to, error: error instanceof Error ? error.message : 'Failed to send message' });
            }
        }

        res.status(200).json({
            success: true,
            results,
            errors,
        });
    } catch (error) {
        console.error('Failed to send bulk messages:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to send bulk messages',
        });
    }
});


export default router;
