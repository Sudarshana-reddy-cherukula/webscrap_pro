const { asyncHandler } = require('./errorMiddleware');

const validateRequest = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details.map(detail => detail.message).join(', '),
      });
    }
    next();
  });
};

const validateQuery = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details.map(detail => detail.message).join(', '),
      });
    }
    next();
  });
};

const validateParams = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details.map(detail => detail.message).join(', '),
      });
    }
    next();
  });
};

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
};
