/**
 * Standard success response
 * @param {import('express').Response} res
 * @param {any} data - Payload to return
 * @param {string} message - Human-readable success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard error response
 * @param {import('express').Response} res
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {any|null} errors - Optional array of field-level errors
 */
const errorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message,
  };

  if (errors !== null) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse,
};
