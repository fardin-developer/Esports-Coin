import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import User, { IUser } from "../model/User"; // Ensure IUser is defined in your model
import { createJWT } from "../utils/jwt";
import ApiKey from "../model/ApiKey";
import crypto from "crypto";


const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};


const saveAPIkey = async (user: IUser): Promise<void> => {
  try {
     await ApiKey.create({
      key: generateApiKey(),
      user: user._id,
    });
      
  } catch (error) {
    console.error("Error saving API key:", error);
  }
};


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body;

    if (await User.findOne({ email })) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already exists" });
      return;
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Extract user data for token
    const { name: userName, email: userEmail } = user;
    const token = createJWT({ name: userName, email: userEmail, _id: user.id });

    // Generate and save API key
     await saveAPIkey(user);

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
