import e, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import User, { IUser } from "../model/User"; // Ensure IUser is defined in your model
import { createJWT } from "../middlewares/jwt";
import crypto from "crypto";


const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body;

    if (await User.findOne({ email })) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already exists" });
      return;
    }
    const apiKey = generateApiKey();
    // Create new user
    const user = await User.create({ name, email, password,apiKey });

    // Extract user data for token
    const { name: userName, email: userEmail } = user;
    const token = createJWT({ name: userName, email: userEmail, _id: user.id });

    // Respond with user data and token
    res.status(StatusCodes.CREATED).json({ user: { name: userName, email: userEmail }, token });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
  }
};


/**
 * Logs in a user by validating the provided email and password. If successful, responds
 * with the logged-in user object.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide email and password" });
      return;
    }

    console.log(email, password);
    

    const user = await User.findOne({ email });
    // if (user && !user.verified) {
    //   res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not verified by admin", status: "not verified" });
    //   return;
    // }

    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid Credentials" });
      return;
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid Credentials" });
      return;
    }
    const { name: userName, email: userEmail,_id:_id } = user;
    const token = createJWT({ name: userName, email: userEmail,_id: user.id });
    res.status(StatusCodes.CREATED).json({ user: { name: userName, email: userEmail }, token });;
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred. Please try again later." });
  }
};

/**
 * Logs out the current user by clearing the authentication cookie.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid token" });
    return;
  }
  const { _id } = req.user;
  const user = await User.findById(_id).select('name email apiKey');
  res.status(StatusCodes.OK).json(user);
};