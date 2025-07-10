import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Order from '../model/Order';
import User from '../model/User';

/**
 * Create a new order
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { orderType, amount, currency, paymentMethod, items, description } = req.body;

    // Validate required fields
    if (!orderType || typeof orderType !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid order type is required' 
      });
      return;
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid amount is required (must be a positive number)' 
      });
      return;
    }

    if (!paymentMethod || typeof paymentMethod !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid payment method is required' 
      });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid items array is required' 
      });
      return;
    }

    if (!description || typeof description !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid description is required' 
      });
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.itemId || !item.itemName || !item.quantity || !item.price) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
          error: 'Each item must have itemId, itemName, quantity, and price' 
        });
        return;
      }
    }

    // Create the order
    const order = new Order({
      userId: req.user._id,
      orderType,
      amount,
      currency: currency || 'INR',
      status: 'pending', // Default status
      paymentMethod,
      items,
      description
    });

    await order.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Order created successfully',
      order: {
        _id: order._id,
        orderType: order.orderType,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        paymentMethod: order.paymentMethod,
        items: order.items,
        description: order.description,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to create order' 
    });
  }
};

/**
 * Get user's order history
 */
export const getOrderHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { page = 1, limit = 10, status, orderType } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    const filter: any = { userId: req.user._id };
    
    if (status && ['pending', 'processing', 'completed', 'cancelled', 'failed'].includes(status as string)) {
      filter.status = status;
    }
    
    if (orderType && typeof orderType === 'string') {
      filter.orderType = orderType;
    }

    // Get orders with pagination
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    // Get total count for pagination
    const total = await Order.countDocuments(filter);

    res.status(StatusCodes.OK).json({
      success: true,
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalOrders: total,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error getting order history:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get order history' 
    });
  }
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { orderId } = req.params;

    if (!orderId) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Order ID is required' });
      return;
    }

    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.user._id 
    }).select('-__v');

    if (!order) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Order not found' });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to get order' 
    });
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      return;
    }

    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Order ID is required' });
      return;
    }

    if (!status || !['pending', 'processing', 'completed', 'cancelled', 'failed'].includes(status)) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Valid status is required (must be pending, processing, completed, cancelled, or failed)' 
      });
      return;
    }

    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.user._id 
    });

    if (!order) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Order not found' });
      return;
    }

    // Update order status
    order.status = status;
    await order.save();

    // If status is completed, you might want to process the order
    // This could involve updating inventory, sending notifications, etc.
    if (status === 'completed') {
      // Add any order completion logic here
      // For example: update inventory, send confirmation email, etc.
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        orderType: order.orderType,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        paymentMethod: order.paymentMethod,
        items: order.items,
        description: order.description,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to update order status' 
    });
  }
}; 