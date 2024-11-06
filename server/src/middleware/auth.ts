import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  user: {
    id: number;
    role: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload['user'];
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    res.status(401).json({ msg: 'No token, authorization denied' });
    return;
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default authMiddleware;