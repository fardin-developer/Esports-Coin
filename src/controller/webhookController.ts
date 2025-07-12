import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Transaction from '../model/Transaction';
import Webhook from '../model/Webhook';
import User from '../model/User';

// Interface for the webhook payload
interface WebhookPayload {
  orderId: string;
  txnId: string;
  amount: number;
  scannerIncluded: boolean;
  customerName: string;
  customerEmail: string;
  customerNumber: number;
  paymentNote: string;
  redirectUrl: string;
  utr: string;
  payerUpi: string;
  status: 'success' | 'failed' | 'pending';
  udf1?: string | null;
  udf2?: string | null;
  udf3?: string | null;
}

/**
 * Handle payment webhook from OneGateway
 */
export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookData: WebhookPayload = req.body;

    // Validate required fields
    if (!webhookData.orderId || !webhookData.txnId || !webhookData.amount) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Missing required fields: orderId, txnId, amount' 
      });
      return;
    }

    // Validate status
    if (!['success', 'failed', 'pending'].includes(webhookData.status)) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Invalid status. Must be success, failed, or pending' 
      });
      return;
    }

    // Check if webhook already exists to prevent duplicates
    const existingWebhook = await Webhook.findOne({ 
      orderId: webhookData.orderId,
      txnId: webhookData.txnId 
    });

    if (existingWebhook) {
      console.log(`Webhook already processed for orderId: ${webhookData.orderId}, txnId: ${webhookData.txnId}`);
      res.status(StatusCodes.OK).json({ 
        message: 'Webhook already processed' 
      });
      return;
    }

    // Save the raw webhook response
    const webhook = new Webhook({
      ...webhookData,
      rawResponse: req.body,
      processed: false
    });

    await webhook.save();

    // Find the corresponding transaction by orderId
    const transaction = await Transaction.findOne({ 
      orderId: webhookData.orderId 
    });

    if (!transaction) {
      console.log(`Transaction not found for orderId: ${webhookData.orderId}`);
      // Still save the webhook but mark it as processed since we can't find the transaction
      webhook.processed = true;
      await webhook.save();
      
      res.status(StatusCodes.OK).json({ 
        message: 'Webhook received but transaction not found',
        orderId: webhookData.orderId
      });
      return;
    }

    // Update the transaction with webhook data
    transaction.txnId = webhookData.orderId;
    transaction.utr = webhookData.utr;
    transaction.payerUpi = webhookData.payerUpi;
    transaction.status = webhookData.status;
    transaction.gatewayResponse = req.body; // Store the complete webhook response

    await transaction.save();

    //Todo check data in onegate db == incoming webhook data
    //add the amount in wallet

    // If payment is successful, update user's wallet balance
    if (webhookData.status === 'success') {
      const user = await User.findById(transaction.userId);
      if (user) {
        // Add the amount to user's wallet
        await user.addToWallet(webhookData.amount);
        console.log(`Updated wallet for user ${user._id} with amount ${webhookData.amount}`);
      }
    }

    // Mark webhook as processed
    webhook.processed = true;
    await webhook.save();

    console.log(`Webhook processed successfully for orderId: ${webhookData.orderId}, status: ${webhookData.status}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Webhook processed successfully',
      orderId: webhookData.orderId,
      txnId: webhookData.txnId,
      status: webhookData.status
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to process webhook' 
    });
  }
};

/**
 * Get webhook history (for debugging/admin purposes)
 */
export const getWebhookHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, processed } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    const filter: any = {};
    
    if (status && ['success', 'failed', 'pending'].includes(status as string)) {
      filter.status = status;
    }
    
    if (processed !== undefined) {
      filter.processed = processed === 'true';
    }

    // Get webhooks with pagination
    const webhooks = await Webhook.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    // Get total count for pagination
    const total = await Webhook.countDocuments(filter);

    res.status(StatusCodes.OK).json({
      success: true,
      webhooks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalWebhooks: total,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error getting webhook history:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get webhook history' 
    });
  }
};

/**
 * Get a specific webhook by ID
 */
export const getWebhookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { webhookId } = req.params;

    if (!webhookId) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Webhook ID is required' });
      return;
    }

    const webhook = await Webhook.findById(webhookId).select('-__v');

    if (!webhook) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Webhook not found' });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      webhook
    });
  } catch (error) {
    console.error('Error getting webhook:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get webhook' 
    });
  }
}; 