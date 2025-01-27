import mongoose, { Document, Schema } from 'mongoose';

interface ApiKeyDocument extends Document {
  key: string;
  user: mongoose.Types.ObjectId;
  webhookUrl:string;
  sessionId:string;
  createdAt: Date;
  expiresAt: Date | null;
  isRevoked: boolean;
}

const apiKeySchema = new Schema<ApiKeyDocument>({
  key: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  webhookUrl: { type: String },
  sessionId:{type: String},
  createdAt: { type: Date, default: Date.now },
  // expiresAt: { type: Date }, // Optional if keys expire
  isRevoked: { type: Boolean, default: false }, // For soft deletion
});

const ApiKey = mongoose.model<ApiKeyDocument>('ApiKey', apiKeySchema);

export default ApiKey; 