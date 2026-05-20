import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/customErrors.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Log unexpected errors
  if (!(err instanceof AppError)) {
    console.error('[UNEXPECTED ERROR]:', err);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'An internal server error occurred.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Handle expected application errors
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors,
  });
};
