import mongoose, { Document, Schema } from 'mongoose';

export interface IDiamondPack extends Document {
  game: mongoose.Types.ObjectId;
  amount: number;
  commission: number;
  cashback: number;
  logo: string;
  description: string;
  status: string;
  apiCalls: number;
  apiProvider: mongoose.Types.ObjectId; // Reference to Api model
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiamondPackSchema = new Schema<IDiamondPack>({
  game: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  cashback: { type: Number, required: true },
  logo: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  apiCalls: { type: Number, required: true },
  apiProvider: { type: Schema.Types.ObjectId, ref: 'Api', required: true },
  productId: { type: String, required: true },
}, {
  timestamps: true
});

const DiamondPack = mongoose.model<IDiamondPack>('DiamondPack', DiamondPackSchema);
export default DiamondPack; 