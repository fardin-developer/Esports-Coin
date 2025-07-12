import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from '../model/User';
import Transaction from '../model/Transaction';
import crypto from 'crypto';

/**
 * Get user's wallet balance
 */
export const getWalletBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id).select('walletBalance');
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      balance: user.walletBalance
    });
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get wallet balance' 
    });
  }
};

/**
 * Handle OneGateway payment webhook/callback
 */
export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, status, amount, transactionId } = req.body;

    if (!orderId) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Order ID is required' 
      });
      return;
    }

    // Find the transaction
    const transaction = await Transaction.findOne({ orderId }).populate('userId');

    if (!transaction) {
      res.status(StatusCodes.NOT_FOUND).json({ 
        error: 'Transaction not found' 
      });
      return;
    }

    // Update transaction status
    transaction.status = status;
    transaction.gatewayResponse = req.body;
    await transaction.save();

    if (status === 'success') {
      // Payment successful - add money to wallet
      const user = await User.findById(transaction.userId);
      
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ 
          error: 'User not found' 
        });
        return;
      }

      // Add amount to wallet
      await user.addToWallet(amount);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Payment processed successfully',
        transaction: {
          _id: transaction._id,
          orderId: transaction.orderId,
          amount: transaction.amount,
          status: transaction.status,
          newBalance: user.walletBalance
        }
      });
    } else {
      // Payment failed or cancelled
      res.status(StatusCodes.OK).json({
        success: false,
        message: `Payment ${status}`,
        transaction: {
          _id: transaction._id,
          orderId: transaction.orderId,
          amount: transaction.amount,
          status: transaction.status
        }
      });
    }
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to process payment webhook' 
    });
  }
};

/**
 * Get transaction history for user
 */
export const getTransactionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    const filter: any = { userId: req.user._id };
    
    if (status && ['pending', 'success', 'failed', 'cancelled'].includes(status as string)) {
      filter.status = status;
    }

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);

    res.status(StatusCodes.OK).json({
      success: true,
      transactions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalTransactions: total,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get transaction history' 
    });
  }
};

/**
 * Create payment request with OneGateway and add money to wallet on success
 */
export const addToWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { amount, redirectUrl } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid amount is required (must be a positive number)' 
      });
      return;
    }

    if (!redirectUrl || typeof redirectUrl !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid redirect URL is required' 
      });
      return;
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
      return;
    }

    // Generate unique order ID
    const orderId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user._id,
      orderId: orderId,
      amount: amount,
      paymentNote: `Wallet recharge - ${amount} INR`,
      customerName: user.name,
      customerEmail: user.email || 'user@example.com',
      customerNumber: user.phone,
      redirectUrl: redirectUrl,
      status: 'pending'
    });

    await transaction.save();

    // Prepare OneGateway payment request
    const paymentData = {
      apiKey: "4a815d23e6503c3ee69e8ecd585a1e32", // Your OneGateway API key
      orderId: orderId,
      amount: amount,
      paymentNote: `Wallet recharge - ${amount} INR`,
      customerName: user.name,
      customerEmail: user.email || 'user@example.com',
      customerNumber: user.phone,
      redirectUrl: redirectUrl
    };

    // Make request to OneGateway
    try {
      const oneGatewayResponse = await fetch('https://merchant.onegateway.in/api/createPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const responseData = await oneGatewayResponse.json();

      // Update transaction with gateway response
      transaction.gatewayResponse = responseData;
      await transaction.save();

      if (oneGatewayResponse.ok && responseData.success) {
        // Payment request created successfully
        res.status(StatusCodes.OK).json({
          success: true,
          message: 'Payment request created successfully',
          transaction: {
            _id: transaction._id,
            orderId: transaction.orderId,
            amount: transaction.amount,
            status: transaction.status,
            paymentUrl: responseData.paymentUrl || responseData.redirectUrl,
            gatewayResponse: responseData
          }
        });
      } else {
        // Payment request failed
        transaction.status = 'failed';
        await transaction.save();

        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: 'Failed to create payment request',
          gatewayError: responseData,
          transaction: {
            _id: transaction._id,
            orderId: transaction.orderId,
            status: transaction.status
          }
        });
      }
    } catch (gatewayError) {
      // Network or other error
      transaction.status = 'failed';
      await transaction.save();

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to communicate with payment gateway',
        gatewayError: (gatewayError as Error).message,
        transaction: {
          _id: transaction._id,
          orderId: transaction.orderId,
          status: transaction.status
        }
      });
    }
  } catch (error) {
    console.error('Error creating payment request:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to create payment request' 
    });
  }
};

/**
 * Deduct money from user's wallet
 */
export const deductFromWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid amount is required (must be a positive number)' 
      });
      return;
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
      return;
    }

    const success = await user.deductFromWallet(amount);

    if (!success) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Insufficient funds in wallet' 
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Successfully deducted $${amount} from wallet`,
      newBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Error deducting from wallet:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to deduct money from wallet' 
    });
  }
}; 