import { Request, Response } from "express";
import { isTokenValid } from "../utils/jwt"; // Function to validate JWT
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";

import Instance from "../model/Instance";

// Generate a random instance key
const generateInstanceKey = (): string => {
  return crypto.randomBytes(32).toString("hex"); // Secure random key
};

// Middleware to extract user from token
const getUserFromToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authentication invalid");
  }

  const token = authHeader.split(" ")[1];
  return isTokenValid(token); // Should return { name, email, userId }
};

// Create a new instance
export const createInstance = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      res.status(401).json({ error: "Unauthorized: User not found" });
      return;
    }

    const instance = await Instance.create({
      key: generateInstanceKey(),
      user: user._id,
      // expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
    });

    res.status(StatusCodes.CREATED).json({ instanceKey: instance.key });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unknown error occurred" });
    }
  }
};

//get a instance by id details
export const getInstanceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    const { id } = req.params;
    console.log(id);
    

    const instance = await Instance.findOne({ _id: id, user: user, isRevoked: false }).select("key createdAt expiresAt");

    if (!instance) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Instance not found" });
      return;
    }

    res.status(StatusCodes.OK).json({ instance });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unknown error occurred" });
    }
  }
};
  
      


// Get all instances for a authenticated user
export const getInstances = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);

    const instances = await Instance.find({ user: user, isRevoked: false }).select("key createdAt expiresAt");
    res.status(StatusCodes.OK).json({ instances });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unknown error occurred" });
    }
  }
};

// Revoke an instance
export const revokeInstance = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    const { key } = req.body;

    const instance = await Instance.findOne({ key, user: user });
    if (!instance) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Instance not found" });
      return;
    }

    instance.isRevoked = true;
    await instance.save();

    res.status(StatusCodes.OK).json({ message: "Instance revoked successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unknown error occurred" });
    }
  }
};
