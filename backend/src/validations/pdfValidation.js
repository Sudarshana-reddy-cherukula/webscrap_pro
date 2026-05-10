const Joi = require('joi');

const extractTextSchema = Joi.object({
  options: Joi.object({
    preserveFormatting: Joi.boolean().default(true),
    language: Joi.string().default('en'),
  }).default(),
});

const extractImagesSchema = Joi.object({
  options: Joi.object({
    imageQuality: Joi.number().min(72).max(600).default(300).messages({
      'number.min': 'Image quality must be between 72 and 600',
      'number.max': 'Image quality must be between 72 and 600',
    }),
    format: Joi.string().valid('png', 'jpg', 'webp').default('png').messages({
      'any.only': 'Format must be png, jpg, or webp',
    }),
  }).default(),
});

const extractMetadataSchema = Joi.object({
  options: Joi.object({
    includeRaw: Joi.boolean().default(false),
  }).default(),
});

const convertToDocxSchema = Joi.object({
  options: Joi.object({
    preserveFormatting: Joi.boolean().default(true),
    includeImages: Joi.boolean().default(false),
  }).default(),
});

const convertToTxtSchema = Joi.object({
  options: Joi.object({
    preserveLineBreaks: Joi.boolean().default(true),
    encoding: Joi.string().valid('utf8', 'ascii', 'utf16').default('utf8').messages({
      'any.only': 'Encoding must be utf8, ascii, or utf16',
    }),
  }).default(),
});

const jobStatusSchema = Joi.object({
  jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid job ID format',
    'any.required': 'Job ID is required',
  }),
});

module.exports = {
  extractTextSchema,
  extractImagesSchema,
  extractMetadataSchema,
  convertToDocxSchema,
  convertToTxtSchema,
  jobStatusSchema,
};
