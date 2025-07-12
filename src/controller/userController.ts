import e, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import User, { IUser } from "../model/User"; // Ensure IUser is defined in your model
import { createJWT } from "../middlewares/jwt";
import crypto from "crypto";
import { createAndSendOTP, verifyOTP } from "../services/otpService";




// Send OTP for phone verification
export const sendPhoneOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    console.log(phone);
    

    if (!phone) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Phone number is required" });
      return;
    }

    const result = await createAndSendOTP(phone);
    
    if (result.success) {
      res.status(StatusCodes.OK).json({ 
        message: result.message,
        phone 
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
  }
};

// Verify OTP and handle user authentication/registration
export const verifyPhoneOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, name, password } = req.body;

    if (!phone || !otp) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Phone number and OTP are required" });
      return;
    }

    const result = await verifyOTP(phone, otp);
    
    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
      return;
    }

    // If user exists, log them in
    if (result.userExists) {
      const user = await User.findOne({ phone });
      if (!user) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "User not found" });
        return;
      }

      const { name: userName, email: userEmail } = user;
      const token = createJWT({ name: userName, email: userEmail, _id: user.id });

      res.status(StatusCodes.OK).json({ 
        message: "Login successful",
        user: { name: userName, email: userEmail }, 
        token,
        isNewUser: false
      });
      return;
    }

    // If user doesn't exist, check if registration data is provided
    if (!name || !password) {
      res.status(StatusCodes.OK).json({ 
        message: "OTP verified. Please provide name and password to complete registration.",
        requiresRegistration: true,
        phone
      });
      return;
    }

    // Create new user
    const user = await User.create({ name, phone, password });

    const { name: userName, email: userEmail } = user;
    const token = createJWT({ name: userName, email: userEmail, _id: user.id });

    res.status(StatusCodes.CREATED).json({ 
      message: "Registration successful",
      user: { name: userName, email: userEmail }, 
      token,
      isNewUser: true
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
  }
};

// Complete registration after OTP verification
export const completeRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, name, email } = req.body;

    if (!phone || !name) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Phone and name are required" });
      return;
    }

    // Check if user already exists
    if (await User.findOne({ phone })) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({ name, phone, email });

    const { name: userName, email: userEmail } = user;
    const token = createJWT({ name: userName, email: userEmail, _id: user.id });

    res.status(StatusCodes.CREATED).json({ 
      message: "Registration completed successfully",
      user: { name: userName, email: userEmail }, 
      token,
      isNewUser: true
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
  }
};

// export const register = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { phone, name, password } = req.body;

//     if (await User.findOne({ phone })) {
//       res.status(StatusCodes.BAD_REQUEST).json({ message: "phone number already exists" });
//       return;
//     }
//     // Create new user
//     const user = await User.create({ name, phone, password });

//     // Extract user data for token
//     const { name: userName, email: userEmail } = user;
//     const token = createJWT({ name: userName, email: userEmail, _id: user.id });

//     // Respond with user data and token
//     res.status(StatusCodes.CREATED).json({ user: { name: userName, email: userEmail }, token });
//   } catch (error) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
//   }
// };


/**
 * Logs in a user by validating the provided email and password. If successful, responds
 * with the logged-in user object.
 */
// export const login = async (req: Request, res: Response): Promise<void> => {
//   const { email, password } = req.body;

//   try {
//     if (!email || !password) {
//       res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide email and password" });
//       return;
//     }

//     console.log(email, password);
    

//     const user = await User.findOne({ email });
//     // if (user && !user.verified) {
//     //   res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not verified by admin", status: "not verified" });
//     //   return;
//     // }

//     if (!user) {
//       res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid Credentials" });
//       return;
//     }

//     const isPasswordCorrect = await user.comparePassword(password);
//     if (!isPasswordCorrect) {
//       res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid Credentials" });
//       return;
//     }
//     const { name: userName, email: userEmail,_id:_id } = user;
//     const token = createJWT({ name: userName, email: userEmail,_id: user.id });
//     res.status(StatusCodes.CREATED).json({ user: { name: userName, email: userEmail }, token });;
//   } catch (error) {
//     console.error(error);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred. Please try again later." });
//   }
// };

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
  const user = await User.findById(_id).select('name email apiKey walletBalance');
  res.status(StatusCodes.OK).json(user);
};