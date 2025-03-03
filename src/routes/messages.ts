import { Router, Request, Response } from 'express';
import { getWhatsAppSocket } from '../services';
import { proto } from '@whiskeysockets/baileys'; // Importing Baileys types
import { WhatsAppService } from '../services/WhatsappService';
import { asyncHandler } from '../middlewares';
import Instance from '../model/Instance';

const whatsappService = WhatsAppService.getInstance();
const router = Router();

router.post('/send', asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    };
    const { to, message, instanceKey }: { to: string; message: string, instanceKey: string } = req.body;
    const instanceDoc = await Instance.findOne({ key: instanceKey, user: req.user._id });

    if (!instanceDoc) {
        throw new Error("Instance not found");
    }
    const sessionId = instanceDoc.sessionId;
    console.log(instanceDoc);
    
    console.log(sessionId);
    
    await whatsappService.sendMessage(sessionId, to, message);
    res.json({ success: true });
}));

router.post('/send-bulk', asyncHandler(async (req: Request, res: Response) => {
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
}));

export default router;
