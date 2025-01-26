import { Request, Response } from "express";
import {isTokenValid} from '../utils/jwt' // Function to validate JWT
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";

import ApiKey from '../model/ApiKey';

// Generate a random API key
const generateApiKey = (): string => {
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

// Create a new API key
export const createApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    
    if (!user) {
      res.status(401).json({ error: "Unauthorized: User not found" });
      return;
    }

    const apiKey = await ApiKey.create({
      key: generateApiKey(),
      user: user._id,
      // expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
    });

    res.status(StatusCodes.CREATED).json({ apiKey: apiKey.key });
  } catch (error) {
    // Check if the error is of type Error
    if (error instanceof Error) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unknown error occurred" });
    }
  }
};

// Get all API keys for the authenticated user
export const getApiKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);

    const apiKeys = await ApiKey.find({ user: user, isRevoked: false }).select("key createdAt expiresAt");
    res.status(StatusCodes.OK).json({ apiKeys });
  } catch (error) {
    // Check if the error is of type Error
    if (error instanceof Error) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unknown error occurred" });
    }
  }
};

// Revoke an API key
export const revokeApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUserFromToken(req);
    const { key } = req.body;

    const apiKey = await ApiKey.findOne({ key, user: user });
    if (!apiKey) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "API key not found" });
      return;
    }

    apiKey.isRevoked = true;
    await apiKey.save();

    res.status(StatusCodes.OK).json({ message: "API key revoked successfully" });
  } catch (error) {
    // Check if the error is of type Error
    if (error instanceof Error) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unknown error occurred" });
    }
  }
};

