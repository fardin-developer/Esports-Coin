import { Request, Response, Router } from "express";
import { WhatsAppService } from "../services/WhatsappService";

const whatsappService = WhatsAppService.getInstance();

const router = Router();

router.post('/get_qr_code', async (req: Request, res: Response) => {
    const { sessionId, qrCode } = await whatsappService.generateSession();
    res.json({ sessionId, qrCode });
});


router.post('/get_qr_code/viewmode', async (req: Request, res: Response) => {
    const { sessionId, qrCode } = await whatsappService.generateSession();
    // Generate the HTML string with the QR code inside an <img> tag
    const qrCodeHTML = `<html>
        <body>
            <p>Session ID: ${sessionId}</p>
            <img src="${qrCode}" alt="QR Code" />
        </body>
    </html>`;
    res.setHeader('Content-Type', 'text/html'); // Set the content type as HTML
    res.send(qrCodeHTML);
});


router.get('/get_session_status/:sessionId', async (req: Request, res: Response) => {
    const status = await whatsappService.getSessionStatus(req.params.sessionId);
    res.json(status);
});


export default router

