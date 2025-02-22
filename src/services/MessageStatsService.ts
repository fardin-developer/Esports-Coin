import mongoose from "mongoose";
import MessageStats from "../model/MessageStats"; // Adjust the path as needed

export class MessageStatsService {
  /**
   * Increment the number of messages sent for the current month.
   *
   * @param userId - The user's ObjectId.
   * @param instanceId - The instance's ObjectId.
   */
  public static async incrementSentMessage(
    userId: mongoose.Types.ObjectId,
    instanceId: mongoose.Types.ObjectId
  ): Promise<void> {
    const monthYear = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    await MessageStats.findOneAndUpdate(
      { user: userId, instance: instanceId, monthYear },
      { $inc: { messagesSent: 1 } },
      { upsert: true, new: true }
    );
  }

  /**
   * Increment the number of messages received for the current month.
   *
   * @param userId - The user's ObjectId.
   * @param instanceId - The instance's ObjectId.
   */
  public static async incrementReceivedMessage(
    userId: mongoose.Types.ObjectId,
    instanceId: mongoose.Types.ObjectId
  ): Promise<void> {
    const monthYear = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    await MessageStats.findOneAndUpdate(
      { user: userId, instance: instanceId, monthYear },
      { $inc: { messagesReceived: 1 } },
      { upsert: true, new: true }
    );
  }
}
