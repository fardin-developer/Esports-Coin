import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Transaction from '../model/Transaction';
import User from '../model/User';

/**
 * Create a new transaction
 */
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { type, amount, method, description } = req.body;

    // Validate required fields
    if (!type || !['credit', 'debit'].includes(type)) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid type is required (must be credit or debit)' 
      });
      return;
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid amount is required (must be a positive number)' 
      });
      return;
    }

    if (!method || typeof method !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid method is required' 
      });
      return;
    }

    if (!description || typeof description !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid description is required' 
      });
      return;
    }

    // Get user and current balance
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
      return;
    }

    // Calculate balance after transaction
    let balanceAfter: number;
    if (type === 'credit') {
      balanceAfter = user.walletBalance + amount;
    } else {
      // For debit, check if user has sufficient balance
      if (user.walletBalance < amount) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
          error: 'Insufficient funds in wallet' 
        });
        return;
      }
      balanceAfter = user.walletBalance - amount;
    }

    // Create the transaction
    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount,
      balanceAfter,
      status: 'pending', // Default status
      method,
      description
    });

    await transaction.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Transaction created successfully',
      transaction: {
        _id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        balanceAfter: transaction.balanceAfter,
        status: transaction.status,
        method: transaction.method,
        description: transaction.description,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to create transaction' 
    });
  }
};

/**
 * Get user's transaction history
 */
export const getTransactionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { page = 1, limit = 10, status, type } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    const filter: any = { userId: req.user._id };
    
    if (status && ['pending', 'success', 'failed'].includes(status as string)) {
      filter.status = status;
    }
    
    if (type && ['credit', 'debit'].includes(type as string)) {
      filter.type = type;
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
 * Get a specific transaction by ID
 */
export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { transactionId } = req.params;

    if (!transactionId) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Transaction ID is required' });
      return;
    }

    const transaction = await Transaction.findOne({ 
      _id: transactionId, 
      userId: req.user._id 
    }).select('-__v');

    if (!transaction) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Transaction not found' });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get transaction' 
    });
  }
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { transactionId } = req.params;
    const { status } = req.body;

    if (!transactionId) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Transaction ID is required' });
      return;
    }

    if (!status || !['pending', 'success', 'failed'].includes(status)) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid status is required (must be pending, success, or failed)' 
      });
      return;
    }

    const transaction = await Transaction.findOne({ 
      _id: transactionId, 
      userId: req.user._id 
    });

    if (!transaction) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Transaction not found' });
      return;
    }

    // Update transaction status
    transaction.status = status;
    await transaction.save();

    // If status is success, update user's wallet
    if (status === 'success') {
      const user = await User.findById(req.user._id);
      if (user) {
        if (transaction.type === 'credit') {
          await user.addToWallet(transaction.amount);
        } else {
          await user.deductFromWallet(transaction.amount);
        }
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Transaction status updated successfully',
      transaction: {
        _id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        balanceAfter: transaction.balanceAfter,
        status: transaction.status,
        method: transaction.method,
        description: transaction.description,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to update transaction status' 
    });
  }
}; 