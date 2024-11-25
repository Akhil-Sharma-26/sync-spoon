// src/utils/errors.ts
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    errorCode?: string;
  
    constructor(
      message: string, 
      statusCode: number = 500, 
      errorCode?: string
    ) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
      this.errorCode = errorCode;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string) {
      super(message, 400, 'VALIDATION_ERROR');
    }
  }
  
  export class DatabaseError extends AppError {
    constructor(
      message: string, 
      statusCode: number = 500, 
      errorCode: string = 'DATABASE_ERROR'
    ) {
      super(message, statusCode, errorCode);
    }
  }
  
  export class ConflictError extends AppError {
    constructor(message: string) {
      super(message, 409, 'CONFLICT_ERROR');
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
      super(message, 404, 'NOT_FOUND');
    }
  }