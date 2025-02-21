import { Request, Response, Router } from 'express';
import { WhatsAppService } from "../services/WhatsappService";
import { isTokenValid } from "../utils/jwt";

const router = Router();
const whatsappService = WhatsAppService.getInstance();

router.get('/get_qr_code', async (req: Request, res: Response) => {
    try {
        const token = req.query.token as string | undefined;
        console.log("hittttt", token);


        if (!token) {
            res.status(400).json({
                success: false,
                msg: 'Token is required'
            });
            return;
        }

        const user = isTokenValid(token);
        console.log(user);


        if (!user) {
            res.status(401).json({
                success: false,
                msg: 'Invalid token'
            });
            return;
        }

        const { sessionId, qrCode } = await whatsappService.generateSession(null, user._id);
        res.json({
            success: true,
            data: { sessionId, qrCodeUrl: qrCode }
        });
        return;

    } catch (error) {
        console.error('Error in QR code generation:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
    }
});

router.get('/get-status', async(req, res) => {
    try {
        const sessionId = req.query.sessionId as string;
        
        if (!sessionId) {
            res.status(400).json({
                success: false,
                msg: 'Session ID is required'
            });
        }

        const sessionStatus = await whatsappService.getSessionStatus(sessionId);

        console.log(sessionStatus);
        res.json({
            success: true,
            data: sessionStatus
        });



    } catch (error) {

    }
})

// router.get('/test',(req,res)=>{
//     console.log('testttt');
    
// })

export default router;