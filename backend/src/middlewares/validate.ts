import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApiError } from '../utils/apiError.ts';
type AnyZodObject = z.ZodObject<any, any>;

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.'),
          message: err.message,
        }));

        return next(new ApiError('Validation Failed', 400, formattedErrors));
      }
      next(error);
    }
  };