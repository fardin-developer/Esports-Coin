import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface for MessageStats
interface IMessageStats extends Document {
  user: mongoose.Types.ObjectId;
  instance: mongoose.Types.ObjectId;
  monthYear: string; // Format: YYYY-MM
  messagesSent: number;
  messagesReceived: number;
  createdAt: Date;
}

// Define the schema
const MessageStatsSchema = new Schema<IMessageStats>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  instance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instance",
    required: true,
  },
  monthYear: {
    type: String,
    required: true,
    index: true, // Optimizes querying by month
  },
  messagesSent: {
    type: Number,
    default: 0,
  },
  messagesReceived: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create an index to prevent duplicate entries for the same instance and month
MessageStatsSchema.index({ user: 1, instance: 1, monthYear: 1 }, { unique: true });

// Create and export the model
const MessageStats: Model<IMessageStats> = mongoose.model<IMessageStats>("MessageStats", MessageStatsSchema);
export default MessageStats;
