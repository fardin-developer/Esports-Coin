import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import User from "../model/User";
// import CustomError from "../errors";
import { createJWT } from "../utils/jwt";
import { isTokenValid } from '../utils/jwt';
import bcrypt from 'bcryptjs';

/**
 * Registers a new user with the provided email, name, and password. Automatically assigns
 * the role of 'admin' to the first registered user and 'user' to others. Responds with the
 * newly created user object.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body;

    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already exists" });
      return;
    }

    const user = await User.create({ name, email, password });
    const { name: userName, email: userEmail} = user;
    const token = createJWT({ name: userName, email: userEmail,_id: user.id });
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

    const user = await User.findOne({ email });
    if (user && !user.verified) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not verified by admin", status: "not verified" });
      return;
    }

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

/**
 * Verifies a JWT and responds with the user details.
 */
// export const jwtVerify = (req: Request, res: Response): void => {
//   const token = req.query.token as string;
//   try {
//     const { name, userId, role } = isTokenValid({ token });
//     res.status(StatusCodes.OK).json({
//       user: {
//         name,
//         userId,
//         role,
//       },
//     });
//   } catch (error) {
//     res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid token" });
//   }
// };

/**
 * Updates a user's profile information, such as name or password.
 */
// export const updateProfile = async (req: Request, res: Response): Promise<void> => {
//   const { name, token, password } = req.query;
//   try {
//     const { userId } = isTokenValid({ token: token as string });

//     const user = await User.findById(userId);
//     if (!user) {
//       res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
//       return;
//     }

//     if (name) {
//       user.name = name as string;
//     }

//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password as string, salt);
//     }

//     await user.save();
//     res.status(StatusCodes.OK).json({ user });
//   } catch (error) {
//     console.error(error);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred. Please try again later." });
//   }
// };
