import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Define the interface for the Order model
export interface IOrder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  orderType: string; // e.g., 'game_purchase', 'coin_purchase', 'subscription'
  amount: number;
  currency: string; // e.g., 'INR', 'USD'
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  paymentMethod: string; // e.g., 'wallet', 'razorpay', 'upi'
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
  }>;
  description: string;
  createdAt: Date;
}

// Create the Order schema
const OrderSchema: Schema<IOrder> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Please provide user ID"],
  },
  orderType: {
    type: String,
    required: [true, "Please provide order type"],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, "Please provide amount"],
    min: [0, 'Amount cannot be negative'],
    validate: {
      validator: function(value: number) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Amount must be a valid number and cannot be negative'
    }
  },
  currency: {
    type: String,
    required: [true, "Please provide currency"],
    default: 'INR',
    trim: true
  },
  status: {
    type: String,
    required: [true, "Please provide status"],
    enum: {
      values: ['pending', 'processing', 'completed', 'cancelled', 'failed'],
      message: 'Status must be pending, processing, completed, cancelled, or failed'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, "Please provide payment method"],
    trim: true
  },
  items: [{
    itemId: {
      type: String,
      required: [true, "Please provide item ID"]
    },
    itemName: {
      type: String,
      required: [true, "Please provide item name"]
    },
    quantity: {
      type: Number,
      required: [true, "Please provide quantity"],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, "Please provide price"],
      min: [0, 'Price cannot be negative']
    }
  }],
  description: {
    type: String,
    required: [true, "Please provide description"],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for better query performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderType: 1 });

// Export the Order model
const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);
export default Order; 