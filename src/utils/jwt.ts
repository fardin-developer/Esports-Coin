import jwt, { JwtPayload } from 'jsonwebtoken';

interface Payload {
  payload: Record<string, any>;
}

interface AttachCookiesParams {
  res: any; // Replace with the type from your framework, e.g., Express.Response
  user: Record<string, any>;
}

export const createJWT = (payload: { name: string; email: string;_id :string }): string => {
  console.log("dfgdfg "+process.env.JWT_SECRET);
  if (!process.env.JWT_SECRET || !process.env.JWT_LIFETIME) {
    throw new Error("JWT_SECRET or JWT_LIFETIME is not defined in environment variables");
  }

const token = jwt.sign(payload, process.env.JWT_SECRET);
return token;
};

export const isTokenValid = (token: string): JwtPayload | null => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null; // Return null if token is invalid
  }
};


export const attachCookiesToResponse = ({ res, user }: AttachCookiesParams): string => {
  const token = createJWT({ name: user.name, email: user.email, _id:user._id });

  const oneDay = 1000 * 60 * 60 * 24 * 15; // 15 days
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: isProduction,
    signed: true,
  });

  return token; // If needed for additional client-side use
};
