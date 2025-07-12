import { Router } from 'express';
import { 
  handlePaymentWebhook, 
  getWebhookHistory, 
  getWebhookById 
} from '../../controller/webhookController';
import { asyncHandler, useAuth, AuthMethod } from '../../middlewares';
import { verifyWebhookSignature, logWebhookRequest } from '../../middlewares/webhookAuth';

const router = Router();

// Webhook endpoint - no authentication required (public endpoint)
router.post('/payment', logWebhookRequest, verifyWebhookSignature, asyncHandler(handlePaymentWebhook));

// Admin routes - require authentication
router.use(useAuth([AuthMethod.JWT]));

// Get webhook history (for debugging/admin purposes)
router.get('/history', asyncHandler(getWebhookHistory));

// Get a specific webhook by ID
router.get('/:webhookId', asyncHandler(getWebhookById));

export default router; 