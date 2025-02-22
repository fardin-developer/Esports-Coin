import { Request, Response, Router } from 'express';
import { WhatsAppService } from "../services/WhatsappService";
import { isTokenValid } from "../utils/jwt";
import { asyncHandler } from '../middlewares';

const router = Router();
const whatsappService = WhatsAppService.getInstance();

router.post('/get_qr_code', asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization as string | undefined;
    const instanceId = req.body.instance_id as string | undefined;

    console.log(token, "the token");

    if (!token) {
        return res.status(400).json({ success: false, msg: 'Token is required' });
    }
    if (!instanceId) {
        return res.status(400).json({ success: false, msg: 'Instance ID is required' });
    }

    const user = isTokenValid(token);
    console.log(user);
    if (!user) {
        return res.status(401).json({ success: false, msg: 'Invalid token' });
    }

    const { sessionId, qrCode } = await whatsappService.generateSession(
        null,
        user._id,
        instanceId
    );

    res.json({ success: true, data: { sessionId, qrCodeUrl: qrCode } });
}));

router.get('/get-status', asyncHandler(async (req: Request, res: Response) => {
    const instanceId = req.query.instance_id as string;
    if (!instanceId) {
        return res.status(400).json({ success: false, msg: 'Session ID is required' });
    }

    const sessionStatus = await whatsappService.getSessionStatusByInstanceId(instanceId);
    console.log(sessionStatus);

    res.json({ success: true, data: sessionStatus });
}));

export default router;
