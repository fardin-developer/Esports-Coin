import { Request, Response, Router } from "express";
import { WhatsAppService } from "../services/WhatsappService";

const whatsappService = WhatsAppService.getInstance();

const router = Router();

router.post('/get_qr_code', async (req: Request, res: Response) => {
    const { sessionId, qrCode } = await whatsappService.generateSession();
    res.json({ sessionId, qrCode });
});

router.get('/get_session_status/:sessionId', async (req: Request, res: Response) => {
    const status = await whatsappService.getSessionStatus(req.params.sessionId);
    res.json(status);
});


export default router