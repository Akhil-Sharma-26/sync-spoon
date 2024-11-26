// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/errors';

export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Error:', err);

  // Handle known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle PostgreSQL specific errors
  if ('code' in err) {
    const pgError = err as any;
    switch (pgError.code) {
      case '23503': // Foreign key constraint violation
        return res.status(409).json({
          success: false,
          message: 'Cannot delete record due to existing dependencies',
          errorCode: 'FOREIGN_KEY_CONSTRAINT',
          ...(process.env.NODE_ENV === 'development' && { 
            detail: pgError.detail 
          })
        });
      
      case '23505': // Unique constraint violation
        return res.status(409).json({
          success: false,
          message: 'A record with these details already exists',
          errorCode: 'UNIQUE_CONSTRAINT',
          ...(process.env.NODE_ENV === 'development' && { 
            detail: pgError.detail 
          })
        });
    }
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    errorCode: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    })
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};