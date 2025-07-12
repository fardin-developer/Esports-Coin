import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Define the interface for the Webhook model
export interface IWebhook extends Document {
  _id: Types.ObjectId;
  orderId: string;
  txnId: string;
  amount: number;
  scannerIncluded: boolean;
  customerName: string;
  customerEmail: string;
  customerNumber: number;
  paymentNote: string;
  redirectUrl: string;
  utr: string;
  payerUpi: string;
  status: 'success' | 'failed' | 'pending';
  udf1?: string | null;
  udf2?: string | null;
  udf3?: string | null;
  rawResponse: any; // Store the complete raw webhook response
  processed: boolean; // Whether the webhook has been processed
  createdAt: Date;
  updatedAt: Date;
}

// Create the Webhook schema
const WebhookSchema: Schema<IWebhook> = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, "Please provide order ID"],
    trim: true
  },
  txnId: {
    type: String,
    required: [true, "Please provide transaction ID"],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, "Please provide amount"],
    min: [0, 'Amount cannot be negative']
  },
  scannerIncluded: {
    type: Boolean,
    required: [true, "Please provide scanner included flag"]
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
    type: Number,
    required: [true, "Please provide customer number"]
  },
  paymentNote: {
    type: String,
    required: [true, "Please provide payment note"],
    trim: true
  },
  redirectUrl: {
    type: String,
    required: [true, "Please provide redirect URL"],
    trim: true
  },
  utr: {
    type: String,
    required: [true, "Please provide UTR"],
    trim: true
  },
  payerUpi: {
    type: String,
    required: [true, "Please provide payer UPI"],
    trim: true
  },
  status: {
    type: String,
    required: [true, "Please provide status"],
    enum: {
      values: ['success', 'failed', 'pending'],
      message: 'Status must be success, failed, or pending'
    }
  },
  udf1: {
    type: String,
    default: null
  },
  udf2: {
    type: String,
    default: null
  },
  udf3: {
    type: String,
    default: null
  },
  rawResponse: {
    type: Schema.Types.Mixed, // Store the complete raw webhook response
    required: [true, "Please provide raw response"]
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
WebhookSchema.index({ orderId: 1 });
WebhookSchema.index({ txnId: 1 });
WebhookSchema.index({ status: 1 });
WebhookSchema.index({ processed: 1 });
WebhookSchema.index({ createdAt: -1 });

// Export the Webhook model
const Webhook: Model<IWebhook> = mongoose.model<IWebhook>("Webhook", WebhookSchema);
export default Webhook; 