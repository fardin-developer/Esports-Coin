import { Router } from 'express';
import { 
  createOrder, 
  getOrderHistory, 
  getOrderById, 
  updateOrderStatus,
  createDiamondPackOrder
} from '../../controller/orderController';
import { asyncHandler, useAuth, AuthMethod } from '../../middlewares';

const router = Router();

// All order routes require authentication
router.use(useAuth([AuthMethod.JWT]));

// Create a new order
router.post('/', asyncHandler(createOrder));

// Create diamond pack order with external API integration
router.post('/diamond-pack', asyncHandler(createDiamondPackOrder));

// Get order history with pagination and filtering
router.get('/history', asyncHandler(getOrderHistory));

// Get a specific order by ID
router.get('/:orderId', asyncHandler(getOrderById));

// Update order status
router.patch('/:orderId/status', asyncHandler(updateOrderStatus));

export default router; 