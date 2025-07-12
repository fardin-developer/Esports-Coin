import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Define the interface for the Transaction model
export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: string; // OneGateway order ID
  txnId?: string; // Transaction ID from gateway
  amount: number;
  paymentNote: string;
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  redirectUrl: string;
  utr?: string; // UTR number
  payerUpi?: string; // Payer UPI ID
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  gatewayResponse?: any; // Store OneGateway response
  createdAt: Date;
  updatedAt: Date;
}

// Create the Transaction schema
const TransactionSchema: Schema<ITransaction> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Please provide user ID"],
  },
  orderId: {
    type: String,
    required: [true, "Please provide order ID"],
    unique: true,
    trim: true
  },
  txnId: {
    type: String,
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
  paymentNote: {
    type: String,
    required: [true, "Please provide payment note"],
    trim: true
  },
  customerName: {
    type: String,
    required: [true, "Please provide customer name"],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, "Please provide customer email"],
    trim: true,
    validate: {
      validator: function(value: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: 'Please provide a valid email address'
    }
  },
  customerNumber: {
    type: String,
    required: [true, "Please provide customer number"],
    trim: true
  },
  redirectUrl: {
    type: String,
    required: [true, "Please provide redirect URL"],
    trim: true
  },
  utr: {
    type: String,
    trim: true
  },
  payerUpi: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: [true, "Please provide status"],
    enum: {
      values: ['pending', 'success', 'failed', 'cancelled'],
      message: 'Status must be pending, success, failed, or cancelled'
    },
    default: 'pending'
  },
  gatewayResponse: {
    type: Schema.Types.Mixed, // Store any JSON response from OneGateway
    default: null
  }
}, {
  timestamps: true
});

// Create index for better query performance
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ orderId: 1 });
TransactionSchema.index({ status: 1 });

// Export the Transaction model
const Transaction: Model<ITransaction> = mongoose.model<ITransaction>("Transaction", TransactionSchema);
export default Transaction; 