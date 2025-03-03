import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import MessageStats from "../model/MessageStats";
export const getData = async(req:Request, res:Response)=>{
    const user = req.user
    if (!user) {
      return;
    }
    // console.log(user);
    
    const messageData = await MessageStats.find({ user: user._id });
    const totalMessagesSent = messageData.reduce((sum, stat) => sum + stat.messagesSent, 0);
    const totalMessagesReceived = messageData.reduce((sum, stat) => sum + stat.messagesReceived, 0);
    const totalMessages = totalMessagesSent + totalMessagesReceived;

    res.status(StatusCodes.OK).json({ 
      messageData, 
      totalMessagesSent, 
      totalMessagesReceived, 
      totalMessages 
    });
}