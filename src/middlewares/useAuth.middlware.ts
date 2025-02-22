import { Request, Response, NextFunction } from 'express';
import { isTokenValid } from './jwt';
import User, { IUser } from '../model/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
};

export enum AuthMethod {
  JWT = 'jwt',
  API_KEY = 'apikey'
};

class AuthError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.statusCode = statusCode;
  }
};

const authenticateWithJWT = async (req: Request): Promise<IUser | null> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const payload = isTokenValid(token);
  
  if (!payload) {
    return null;
  }

  return await User.findById(payload._id).select('-password');
};

const authenticateWithApiKey = async (req: Request): Promise<IUser | null> => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return null;
  }

  return await User.findOne({ apiKey }).select('-password');
};

export const useAuth = (methods: AuthMethod[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user: IUser | null = null;

      if (methods.includes(AuthMethod.JWT)) {
        user = await authenticateWithJWT(req);
      };

      if (!user && methods.includes(AuthMethod.API_KEY)) {
        user = await authenticateWithApiKey(req);
      };

      if (!user) {
        const allowedMethods = methods.join(' or ');
        throw new AuthError(
          `Authentication failed. Required: ${allowedMethods}`,
          401
        );
      };
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Authentication error' });
      }
    }
  };
};