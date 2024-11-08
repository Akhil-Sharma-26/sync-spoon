import type { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const { method, path, ip } = req;

  // Log request details
  console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);

  // Optional: Track response time
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${method} ${path} - Status: ${res.statusCode} - ${duration}ms`);
  });

  next();
};