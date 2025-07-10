import { Router } from 'express';
import { getWalletBalance, addToWallet, deductFromWallet } from '../../controller/walletController';
import { asyncHandler, useAuth, AuthMethod } from '../../middlewares';

const router = Router();

// All wallet routes require authentication
router.use(useAuth([AuthMethod.JWT]));

// Get wallet balance
router.get('/balance', asyncHandler(getWalletBalance));

// Add money to wallet
router.post('/add', asyncHandler(addToWallet));

// Deduct money from wallet
router.post('/deduct', asyncHandler(deductFromWallet));

export default router; 