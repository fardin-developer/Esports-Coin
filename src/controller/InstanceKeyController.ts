import { Request, Response } from "express";
import { isTokenValid } from "../middlewares/jwt"; // Function to validate JWT
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";

import Instance from "../model/Instance";
import { WhatsAppService } from "../services/WhatsappService";

// Generate a random instance key
const generateInstanceKey = (): string => {
  return crypto.randomBytes(32).toString("hex"); // Secure random key
};


// Create a new instance
export const createInstance = async (req: Request, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      return;
    }

    const instance = await Instance.create({
      key: generateInstanceKey(),
      user: user._id,
      // expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
    });

    res.status(StatusCodes.CREATED).json({ instance });

};

export const getInstanceByKey = async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    const { key } = req.params;
    console.log(key);

    const instance = await Instance.findOne({ key: key, user: user, isRevoked: false }).select("key createdAt expiresAt connected");

    if (!instance) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Instance not found" });
      return;
    }

    res.status(StatusCodes.OK).json({ instance });
  
};
  
export const getInstances = async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    const instances = await Instance.find({ user: user, isRevoked: false });
    console.log(instances);
    
    res.status(StatusCodes.OK).json({ instances });
};

export const revokeInstance = async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    const { key } = req.body;
    const instance = await Instance.findOne({ key, user: user });
    if (!instance) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Instance not found" });
      return;
    }
    instance.isRevoked = true;
    await instance.save();

    res.status(StatusCodes.OK).json({ message: "Instance revoked successfully" });
};

export const disconnectInstance = async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
    }
    const instanceKey = req.body.instance_key;
    const instance = await Instance.findOne({ key: instanceKey });
    if (!instance) {
        res.status(StatusCodes.NOT_FOUND).json({ message: "Instance not found" });
        return;
    }
    WhatsAppService.getInstance().cleanupSession(instance.sessionId)
    res.status(StatusCodes.OK).json({ message: "Instance disconnected successfully" });
};