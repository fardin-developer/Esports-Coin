import { Router } from 'express';
import { 
  createTransaction, 
  getTransactionHistory, 
  getTransactionById, 
  updateTransactionStatus 
} from '../../controller/transactionController';
import { asyncHandler, useAuth, AuthMethod } from '../../middlewares';

const router = Router();

// All transaction routes require authentication
router.use(useAuth([AuthMethod.JWT]));

// Create a new transaction
router.post('/', asyncHandler(createTransaction));

// Get transaction history with pagination and filtering
router.get('/history', asyncHandler(getTransactionHistory));

// Get a specific transaction by ID
router.get('/:transactionId', asyncHandler(getTransactionById));

// Update transaction status
router.patch('/:transactionId/status', asyncHandler(updateTransactionStatus));

export default router; 