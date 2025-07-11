import mongoose, { Schema, Document, Model, Types } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

// Define the interface for the User model
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  verified: boolean;
  password: string;
  apiKey: string | null;
  walletBalance: number;
  // comparePassword(candidatePassword: string): Promise<boolean>;
  addToWallet(amount: number): Promise<void>;
  deductFromWallet(amount: number): Promise<boolean>;
}

// Create the User schema
const UserSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 30,
  },
  phone: {
    type: String,
    required: [true, "Please provide phone number"],
    unique: true,
    validate: {
      validator: function(value: string) {
        // Indian mobile number validation
        // Accepts formats: +919876543210, 9876543210, +91 98765 43210, 98765-43210
        // Indian mobile numbers start with 6, 7, 8, or 9 and are exactly 10 digits
        const cleanNumber = value.replace(/[\s\-\(\)]/g, '');
        
        // Check if it starts with +91 (country code)
        if (cleanNumber.startsWith('+91')) {
          const numberWithoutCode = cleanNumber.substring(3);
          return /^[6-9]\d{9}$/.test(numberWithoutCode);
        }
        
        // Check if it's a 10-digit Indian mobile number
        return /^[6-9]\d{9}$/.test(cleanNumber);
      },
      message: "Please provide a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)"
    }
  },
  email: {
    type: String,
    unique: true,
    required: [false, "Please provide email"],
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: "Please provide valid email",
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  // password: {
  //   type: String,
  //   required: [true, "Please provide password"],
  //   minlength: 6,
  // },
  // apiKey: {
  //   type: String,
  //   minlength: 6,
  // },
  walletBalance: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative'],
    validate: {
      validator: function(value: number) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Wallet balance must be a valid number and cannot be negative'
    }
  },
});

// Middleware to hash password before saving
// UserSchema.pre<IUser>("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Add an instance method for comparing passwords
// UserSchema.methods.comparePassword = async function (
//   candidatePassword: string
// ): Promise<boolean> {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// Add money to wallet (safe addition)
UserSchema.methods.addToWallet = async function(amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }
  
  // Use atomic operation to prevent race conditions
  const result = await (this.constructor as Model<IUser>).findByIdAndUpdate(
    this._id,
    { $inc: { walletBalance: amount } },
    { new: true, runValidators: true }
  );
  
  if (!result) {
    throw new Error('Failed to update wallet balance');
  }
  
  this.walletBalance = result.walletBalance;
};

// Deduct money from wallet (safe subtraction)
UserSchema.methods.deductFromWallet = async function(amount: number): Promise<boolean> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }
  
  // Check if user has sufficient balance
  if (this.walletBalance < amount) {
    return false; // Insufficient funds
  }
  
  // Use atomic operation to prevent race conditions
  const result = await (this.constructor as Model<IUser>).findByIdAndUpdate(
    this._id,
    { $inc: { walletBalance: -amount } },
    { new: true, runValidators: true }
  );
  
  if (!result) {
    throw new Error('Failed to update wallet balance');
  }
  
  this.walletBalance = result.walletBalance;
  return true; // Successfully deducted
};

// Export the User model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
