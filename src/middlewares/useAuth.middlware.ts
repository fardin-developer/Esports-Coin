import { Request, Response, NextFunction } from 'express';
import { isTokenValid } from './jwt';
import User, { IUser } from '../model/User';
import { Types, Document } from 'mongoose';

export interface AuthenticatedUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export enum AuthMethod {
  JWT = 'jwt',
  API_KEY = 'apikey'
}

class AuthError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.statusCode = statusCode;
  }
}

const transformUser = (user: Document<unknown, {}, IUser> & IUser): AuthenticatedUser => {
  return {
    _id: user._id,
    email: user.email,
    name: user.name
  };
};

const authenticateWithJWT = async (req: Request): Promise<AuthenticatedUser | null> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const payload = isTokenValid(token);
  
  if (!payload) {
    return null;
  }

  const user = await User.findById(payload._id).select('_id email name');
  return user ? transformUser(user) : null;
};

const authenticateWithApiKey = async (req: Request): Promise<AuthenticatedUser | null> => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return null;
  }

  const user = await User.findOne({ apiKey }).select('_id email name');
  return user ? transformUser(user) : null;
};

export const useAuth = (methods: AuthMethod[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user: AuthenticatedUser | null = null;

      if (methods.includes(AuthMethod.JWT)) {
        user = await authenticateWithJWT(req);
      }

      if (!user && methods.includes(AuthMethod.API_KEY)) {
        user = await authenticateWithApiKey(req);
      }

      if (!user) {
        const allowedMethods = methods.map(m => 
          m === AuthMethod.JWT ? 'JWT' : 'API Key'
        ).join(' or ');
        throw new AuthError(
          `Authentication failed. Required: ${allowedMethods}`,
          401
        );
      }

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