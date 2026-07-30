import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.ts';

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.log("error", err)
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    message: err.message || 'Internal Server Error',
    ...(err.errors && { errors: err.errors }),
  });
};