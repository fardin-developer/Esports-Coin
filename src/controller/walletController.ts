import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from '../model/User';

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
 * Add money to user's wallet
 */
export const addToWallet = async (req: Request, res: Response): Promise<void> => {
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

    await user.addToWallet(amount);

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Successfully added ${amount} to wallet`,
      newBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Error adding to wallet:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to add money to wallet' 
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