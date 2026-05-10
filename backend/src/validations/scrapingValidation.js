const Joi = require('joi');

const scrapeUrlSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please enter a valid URL',
    'any.required': 'URL is required',
  }),
  options: Joi.object({
    extractTitle: Joi.boolean().default(true),
    extractHeadings: Joi.boolean().default(true),
    extractParagraphs: Joi.boolean().default(true),
    extractTables: Joi.boolean().default(false),
    extractLinks: Joi.boolean().default(false),
    extractImages: Joi.boolean().default(false),
    extractMetadata: Joi.boolean().default(true),
    timeout: Joi.number().min(1000).max(30000).default(30000).messages({
      'number.min': 'Timeout must be at least 1000ms',
      'number.max': 'Timeout cannot exceed 30000ms',
    }),
    userAgent: Joi.string().optional(),
    waitForSelector: Joi.string().optional(),
  }).default(),
});

const scrapeImagesSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please enter a valid URL',
    'any.required': 'URL is required',
  }),
  options: Joi.object({
    timeout: Joi.number().min(1000).max(30000).default(30000),
    userAgent: Joi.string().optional(),
    waitForSelector: Joi.string().optional(),
  }).default(),
});

const scrapeLinksSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please enter a valid URL',
    'any.required': 'URL is required',
  }),
  options: Joi.object({
    timeout: Joi.number().min(1000).max(30000).default(30000),
    userAgent: Joi.string().optional(),
    waitForSelector: Joi.string().optional(),
  }).default(),
});

const scrapeMetadataSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please enter a valid URL',
    'any.required': 'URL is required',
  }),
  options: Joi.object({
    timeout: Joi.number().min(1000).max(30000).default(30000),
    userAgent: Joi.string().optional(),
  }).default(),
});

const jobStatusSchema = Joi.object({
  jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid job ID format',
    'any.required': 'Job ID is required',
  }),
});

module.exports = {
  scrapeUrlSchema,
  scrapeImagesSchema,
  scrapeLinksSchema,
  scrapeMetadataSchema,
  jobStatusSchema,
};
