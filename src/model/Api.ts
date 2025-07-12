import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Define the interface for the API model
export interface IApi extends Document {
  _id: Types.ObjectId;
  name: string;
  apiUrl: string;
  description?: string;
  partnerId?: string; // For external API authentication
  secretKey?: string; // For external API authentication
  createdAt: Date;
  updatedAt: Date;
}

// Create the API schema
const ApiSchema: Schema<IApi> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide API name"],
    minlength: 2,
    maxlength: 100,
    trim: true,
  },
  apiUrl: {
    type: String,
    required: [true, "Please provide API link"],
    trim: true,
    validate: {
      validator: function(value: string) {
        // Basic URL validation
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: "Please provide a valid URL for the API link"
    }
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true,
  },
  partnerId: {
    type: String,
    trim: true,
  },
  secretKey: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Export the API model
const Api: Model<IApi> = mongoose.model<IApi>("Api", ApiSchema);
export default Api; 