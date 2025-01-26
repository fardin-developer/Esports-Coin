import mongoose, { ConnectOptions } from "mongoose"; // Import mongoose and types

mongoose.set("strictQuery", false); // Address deprecation warnings by configuring mongoose settings

/**
 * Connects to the MongoDB database using a provided connection string.
 * @param url - The MongoDB connection string.
 * @returns A promise that resolves when the connection is successfully established.
 */
const connectDB = (url: string): Promise<typeof mongoose> => {
  return mongoose.connect(url, {
    useNewUrlParser: true, // Use the new URL parser for MongoDB connection strings
    useUnifiedTopology: true, // Use the new Unified Topology layer
  } as ConnectOptions); // Ensure options match the ConnectOptions type
};

export default connectDB; // Export the function as default
