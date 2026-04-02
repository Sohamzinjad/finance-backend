const { z } = require('zod');
const { errorResponse } = require('../utils/response');

/**
 * Zod request body validation middleware factory.
 * @param {z.ZodSchema} schema - A Zod schema to validate req.body against
 * @returns Express middleware function
 *
 * Usage: router.post('/', validate(myZodSchema), handler)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return errorResponse(res, 'Validation failed', 400, errors);
    }

    // Replace req.body with the parsed (coerced/transformed) output
    req.body = result.data;
    next();
  };
};

module.exports = validate;
