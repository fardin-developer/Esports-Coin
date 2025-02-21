import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface for the Payment model
interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  pricingPlan: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: string; 
  transactionId: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pricingPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pricing",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: "USD",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true, 
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment: Model<IPayment> = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
