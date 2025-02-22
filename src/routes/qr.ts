import { Request, Response, Router } from 'express';
import { WhatsAppService } from "../services/WhatsappService";
import { isTokenValid } from "../middlewares/jwt";
import { asyncHandler } from '../middlewares';

const router = Router();
const whatsappService = WhatsAppService.getInstance();

router.post('/get_qr_code', asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace("Bearer ", ""); 
    const instanceKey = req.body.instance_key;

    console.log(token, "the token");

    if (!token) return res.status(400).json({ success: false, msg: 'Token is required' });
    if (!instanceKey) return res.status(400).json({ success: false, msg: 'Instance ID is required' });

    const user = isTokenValid(token);
    console.log("user:", user);
    
    if (!user) return res.status(401).json({ success: false, msg: 'Invalid token' });

    const { sessionId, qrCode } = await whatsappService.generateSession(null, user._id, instanceKey);

    res.json({ success: true, data: { sessionId, qrCodeUrl: qrCode } });
}));


router.get('/get-status', asyncHandler(async (req: Request, res: Response) => {
    const instanceKey = req.query.instance_key as string;
    if (!instanceKey) {
        return res.status(400).json({ success: false, msg: 'Session ID is required' });
    }

    const sessionStatus = await whatsappService.getSessionStatusByInstanceKey(instanceKey);
    console.log(sessionStatus);

    res.json({ success: true, data: sessionStatus });
}));

export default router;
