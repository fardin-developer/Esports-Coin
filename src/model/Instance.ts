import mongoose, { Document, Schema } from 'mongoose';

interface InstanceDocument extends Document {
  key: string;
  user: mongoose.Types.ObjectId;
  webhookUrl: string;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date | null;
  isRevoked: boolean;
  connected: boolean;
}

const instanceSchema = new Schema<InstanceDocument>({
  key: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  webhookUrl: { type: String },
  sessionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  isRevoked: { type: Boolean, default: false },
  connected: { type: Boolean, default: false },
});

const Instance = mongoose.model<InstanceDocument>('Instance', instanceSchema);

export default Instance;
