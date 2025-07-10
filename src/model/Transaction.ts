import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Define the interface for the Transaction model
export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  status: 'pending' | 'success' | 'failed';
  method: string;
  description: string;
  createdAt: Date;
}

// Create the Transaction schema
const TransactionSchema: Schema<ITransaction> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Please provide user ID"],
  },
  type: {
    type: String,
    required: [true, "Please provide transaction type"],
    enum: {
      values: ['credit', 'debit'],
      message: 'Type must be either credit or debit'
    }
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
  balanceAfter: {
    type: Number,
    required: [true, "Please provide balance after transaction"],
    validate: {
      validator: function(value: number) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Balance after must be a valid number and cannot be negative'
    }
  },
  status: {
    type: String,
    required: [true, "Please provide status"],
    enum: {
      values: ['pending', 'success', 'failed'],
      message: 'Status must be pending, success, or failed'
    },
    default: 'pending'
  },
  method: {
    type: String,
    required: [true, "Please provide payment method"],
    trim: true
  },
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
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });

// Export the Transaction model
const Transaction: Model<ITransaction> = mongoose.model<ITransaction>("Transaction", TransactionSchema);
export default Transaction; 