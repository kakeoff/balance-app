import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from './apiError';

export const validateUpdateBalance = [
  (req: Request, res: Response, next: NextFunction) => {
    const { userId, amount } = req.body;

    if (!userId || isNaN(Number(userId))) {
      return next(new ApiError(400, 'Invalid user ID'));
    }

    if (!amount || isNaN(Number(amount))) {
      return next(new ApiError(400, 'Invalid amount'));
    }

    next();
  }
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation error', errors.array()));
  }
  next();
};
