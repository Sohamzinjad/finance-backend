const { errorResponse } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

module.exports = errorHandler;
