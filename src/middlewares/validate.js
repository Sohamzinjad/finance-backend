const { z } = require('zod');
const { errorResponse } = require('../utils/response');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(res, 'Validation Error', 400, error.errors);
      }
      next(error);
    }
  };
};

module.exports = validate;
