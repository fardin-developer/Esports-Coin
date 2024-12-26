import {Express, Request,Response, Router } from "express";
import { getLatestQR } from "../services";

const router = Router();

router.get('/api', (req: Request, res: Response) => {
    const qrCode = getLatestQR();
    if (qrCode) {
        res.json({ qrCode });
    } else {
        res.status(404).json({ error: 'QR code not available yet' });
    }
});

export default router