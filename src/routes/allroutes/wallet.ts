import { Router } from 'express';
import { getWalletBalance, addToWallet, deductFromWallet, handlePaymentWebhook, getTransactionHistory } from '../../controller/walletController';
import { asyncHandler, useAuth, AuthMethod } from '../../middlewares';

const router = Router();

// Get wallet balance
router.get('/balance', useAuth([AuthMethod.JWT]), asyncHandler(getWalletBalance));

// Add money to wallet (creates OneGateway payment)
router.post('/add', useAuth([AuthMethod.JWT]), asyncHandler(addToWallet));

// Handle OneGateway payment webhook (no auth required)
router.post('/webhook', asyncHandler(handlePaymentWebhook));

// Get transaction history
router.get('/transactions', useAuth([AuthMethod.JWT]), asyncHandler(getTransactionHistory));

// Deduct money from wallet
router.post('/deduct', useAuth([AuthMethod.JWT]), asyncHandler(deductFromWallet));

export default router; 