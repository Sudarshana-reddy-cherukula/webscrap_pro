const Joi = require('joi');

const exportSchema = Joi.object({
  sourceType: Joi.string().valid('scraping', 'pdf').required().messages({
    'any.only': 'Source type must be scraping or pdf',
    'any.required': 'Source type is required',
  }),
  sourceId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid source ID format',
    'any.required': 'Source ID is required',
  }),
  exportType: Joi.string().valid('json', 'csv', 'txt', 'pdf').required().messages({
    'any.only': 'Export type must be json, csv, txt, or pdf',
    'any.required': 'Export type is required',
  }),
  options: Joi.object({
    includeHeaders: Joi.boolean().default(true),
    dateFormat: Joi.string().valid('ISO', 'US', 'EU').default('ISO').messages({
      'any.only': 'Date format must be ISO, US, or EU',
    }),
    encoding: Joi.string().valid('utf8', 'ascii', 'utf16').default('utf8').messages({
      'any.only': 'Encoding must be utf8, ascii, or utf16',
    }),
    delimiter: Joi.string().default(','),
    sheetName: Joi.string().default('Export'),
  }).default(),
});

const exportStatusSchema = Joi.object({
  exportId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid export ID format',
    'any.required': 'Export ID is required',
  }),
});

const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1).messages({
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().min(1).max(100).default(10).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Sort order must be asc or desc',
  }),
});

module.exports = {
  exportSchema,
  exportStatusSchema,
  paginationSchema,
};
