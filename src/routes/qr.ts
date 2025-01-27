import { Request, Response, Router } from 'express';
import { WhatsAppService } from "../services/WhatsappService";
import { isTokenValid } from "../utils/jwt";

const router = Router();
const whatsappService = WhatsAppService.getInstance();

router.post('/get_qr_code', async (req: Request, res: Response) => {
    try {
        const token = req.query.token as string | undefined;
        
        if (!token) {
            res.status(400).json({ 
                success: false,
                msg: 'Token is required' 
            });
            return; // Return after sending response
        }

        const user = isTokenValid(token);
        console.log(user);
        
        
        if (!user) {
            res.status(401).json({ 
                success: false,
                msg: 'Invalid token' 
            });
            return; // Return after sending response
        }

        const { sessionId, qrCode } = await whatsappService.generateSession(null, user._id);
        res.json({
            success: true,
            data: { sessionId, qrCode }
        });
        return; // Optional but consistent

    } catch (error) {
        console.error('Error in QR code generation:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return; // Return after sending error response
    }
});

export default router;