import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
  name: string;
  image: string;
  publisher?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema<IGame>(
  {
    name: {
      type: String,
      required: [true, 'Game name is required'],
      trim: true,
      maxlength: [100, 'Game name cannot be more than 100 characters']
    },
    image: {
      type: String,
      required: [true, 'Game image is required'],
      trim: true
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, 'Publisher name cannot be more than 100 characters']
    }
  },
  {
    timestamps: true
  }
);

const Game = mongoose.model<IGame>('Game', GameSchema);

export default Game; 