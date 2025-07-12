import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// You can set this in your environment variables
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-key';

export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    
    if (!signature) {
      console.warn('Webhook signature missing');
      // For now, we'll allow webhooks without signature for development
      // In production, you should return 401 here
      next();
      return;
    }

    // Create signature from request body
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    // Compare signatures
    if (signature !== expectedSignature) {
      console.warn('Invalid webhook signature');
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    res.status(500).json({ error: 'Webhook verification failed' });
  }
};

export const logWebhookRequest = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`Webhook received: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
}; 