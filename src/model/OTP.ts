import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Define the interface for the OTP model
export interface IOTP extends Document {
  _id: Types.ObjectId;
  phone: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

// Create the OTP schema
const OTPSchema: Schema<IOTP> = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, "Please provide phone number"],
    index: true,
  },
  otp: {
    type: String,
    required: [true, "Please provide OTP"],
    length: 6,
  },
  expiresAt: {
    type: Date,
    required: [true, "Please provide expiration time"],
    index: { expireAfterSeconds: 0 }, // TTL index to automatically delete expired OTPs
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the OTP model
const OTP: Model<IOTP> = mongoose.model<IOTP>("OTP", OTPSchema);
export default OTP; 