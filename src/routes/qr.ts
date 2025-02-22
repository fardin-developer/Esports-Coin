import { Request, Response, Router } from 'express';
import { WhatsAppService } from "../services/WhatsappService";
import { asyncHandler } from '../middlewares';

const router = Router();
const whatsappService = WhatsAppService.getInstance();

router.post('/get_qr_code', asyncHandler(async (req: Request, res: Response) => {
    const instanceKey = req.body.instance_key as string | undefined;

    if (!instanceKey) {
        return res.status(400).json({ success: false, msg: 'Instance ID is required' });
    }

    const { sessionId, qrCode } = await whatsappService.generateSession(
        null,
        req.user?._id.toString() || '',
        instanceKey
    );

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
