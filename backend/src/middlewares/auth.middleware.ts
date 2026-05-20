import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/customErrors.js';
import { TokenPayload } from '../utils/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <TOKEN>

  if (!token) {
    return next(new UnauthorizedError('Access token is missing from the authorization header.'));
  }

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    return next(new Error('JWT_ACCESS_SECRET environment variable is missing.'));
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return next(new UnauthorizedError('Access token is invalid or has expired.'));
    }
    req.user = decoded as TokenPayload;
    next();
  });
};

export const requireRole = (...allowedRoles: ('USER' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role as 'USER' | 'ADMIN')) {
      return next(
        new ForbiddenError('Privileged access denied: Insufficient role authorization privileges.')
      );
    }

    next();
  };
};
