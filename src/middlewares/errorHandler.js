const { Prisma } = require('@prisma/client');
const { z } = require('zod');
const { errorResponse } = require('../utils/response');

/**
 * Global error handler middleware.
 * Must be registered with 4 arguments so Express treats it as an error handler.
 * Usage: app.use(errorHandler) — after all routes
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${err.name}: ${err.message}`);
  }

  // --- Prisma Known Request Errors ---
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const field = err.meta?.target?.[0] || 'field';
        return errorResponse(res, `A record with this ${field} already exists`, 409);
      }
      case 'P2025':
        // Record not found
        return errorResponse(res, 'The requested resource was not found', 404);
      case 'P2003':
        // Foreign key constraint failure
        return errorResponse(res, 'Invalid reference: related resource not found', 400);
      default:
        return errorResponse(res, 'Database error occurred', 500);
    }
  }

  // --- Prisma Validation Errors ---
  if (err instanceof Prisma.PrismaClientValidationError) {
    return errorResponse(res, 'Invalid data sent to the database', 400);
  }

  // --- Zod Validation Errors ---
  if (err instanceof z.ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  // --- JWT Errors ---
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token has expired, please login again', 401);
  }
  if (err.name === 'NotBeforeError') {
    return errorResponse(res, 'Token not yet active', 401);
  }

  // --- Custom Application Errors (thrown with statusCode) ---
  if (err.statusCode) {
    return errorResponse(res, err.message, err.statusCode);
  }

  // --- Default Internal Server Error ---
  return errorResponse(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
};

module.exports = errorHandler;
