import mongoose, { Document, Schema, Model } from "mongoose";

interface IPlan extends Document {
  name: string;
  price: number; 
  features: string[]; 
  maxInstances: number; 
  createdAt: Date;
}

// Define the Plan schema
const PlanSchema = new Schema<IPlan>({
  name: {
    type: String,
    required: [true, "Please provide a plan name"],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
    min: 0, 
  },
  features: {
    type: [String],
    required: true,
  },
  maxInstances: {
    type: Number,
    required: true,
    min: 1, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Plan: Model<IPlan> = mongoose.model<IPlan>("Plan", PlanSchema);
export default Plan;
