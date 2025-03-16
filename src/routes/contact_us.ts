import { Router, Request, Response } from 'express';
import ContactUs from '../model/ContactUs';
import { asyncHandler } from '../middlewares';

const router = Router();

router.post('/submit', asyncHandler(async (req: Request, res: Response) => {
    const { email, message }: { email: string; message: string } = req.body;
    if (!email || !message) {
        res.status(400).json({ success: false, error: 'Email and message are required' });
        return;
    }
    const contactUs = new ContactUs({ email, message });
    await contactUs.save();
    res.json({ success: true });
}));

export default router;