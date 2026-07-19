const { asyncHandler } = require('./errorMiddleware');

const validateRequest = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const { error, value } = schema.validate(req.body, { convert: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details.map(detail => detail.message).join(', '),
      });
    }
    req.body = value;
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

const validateZod = (schema, source = 'body') => {
  return asyncHandler(async (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
      });
    }
    req[source] = result.data;
    next();
  });
};

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
  validateZod,
};
