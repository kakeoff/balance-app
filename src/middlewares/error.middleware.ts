import { ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/apiError';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req,
  res,
  next
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof Error) {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
    return;
  }

  console.error('Unknown error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
