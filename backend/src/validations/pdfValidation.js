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

const modifyTextSchema = Joi.object({
  operation: Joi.string().valid('replace', 'append', 'prepend', 'remove').required().messages({
    'any.only': 'Operation must be replace, append, prepend, or remove',
    'any.required': 'Operation is required',
  }),
  searchText: Joi.string().when('operation', {
    is: 'replace',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({
    'any.required': 'Search text is required for replace operation',
  }),
  replaceText: Joi.string().allow('').optional(),
  targetPages: Joi.string().optional(),
});

const addWatermarkSchema = Joi.object({
  watermarkText: Joi.string().required().messages({
    'any.required': 'Watermark text is required',
  }),
  opacity: Joi.number().min(0).max(1).default(0.3).messages({
    'number.min': 'Opacity must be between 0 and 1',
    'number.max': 'Opacity must be between 0 and 1',
  }),
  rotation: Joi.number().default(-45),
  fontSize: Joi.number().min(8).max(200).default(72).messages({
    'number.min': 'Font size must be at least 8',
    'number.max': 'Font size cannot exceed 200',
  }),
  color: Joi.string().default('#cccccc'),
  position: Joi.string().valid('center', 'tile', 'top-left', 'top-right', 'bottom-left', 'bottom-right').default('center').messages({
    'any.only': 'Position must be center, tile, top-left, top-right, bottom-left, or bottom-right',
  }),
});

const addSecuritySchema = Joi.object({
  password: Joi.string().min(1).required().messages({
    'any.required': 'Password is required',
  }),
  permissions: Joi.object({
    printing: Joi.string().valid('none', 'low', 'high').default('high'),
    modifying: Joi.boolean().default(false),
    copying: Joi.boolean().default(false),
    annotating: Joi.boolean().default(false),
    fillingForms: Joi.boolean().default(false),
    accessibility: Joi.boolean().default(true),
    assembling: Joi.boolean().default(false),
  }).default(),
});

const splitPdfSchema = Joi.object({
  mode: Joi.string().valid('all', 'range', 'pages').required().messages({
    'any.only': 'Mode must be all, range, or pages',
    'any.required': 'Mode is required',
  }),
  pages: Joi.alternatives().conditional('mode', {
    is: 'range',
    then: Joi.string().required().messages({ 'any.required': 'Page range is required (e.g. 1-5)' }),
    otherwise: Joi.alternatives().conditional('mode', {
      is: 'pages',
      then: Joi.string().required().messages({ 'any.required': 'Page numbers are required (e.g. 1,3,5)' }),
      otherwise: Joi.optional(),
    }),
  }),
});

const mergePdfSchema = Joi.object({
  fileOrder: Joi.array().items(Joi.string()).optional(),
});

const rotatePagesSchema = Joi.object({
  rotation: Joi.number().valid(90, 180, 270).required().messages({
    'any.only': 'Rotation must be 90, 180, or 270 degrees',
    'any.required': 'Rotation is required',
  }),
  pages: Joi.string().optional(),
});

const cropPagesSchema = Joi.object({
  top: Joi.number().min(0).default(0),
  right: Joi.number().min(0).default(0),
  bottom: Joi.number().min(0).default(0),
  left: Joi.number().min(0).default(0),
  unit: Joi.string().valid('pt', 'mm', 'in').default('pt').messages({
    'any.only': 'Unit must be pt, mm, or in',
  }),
  pages: Joi.string().optional(),
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
  modifyTextSchema,
  addWatermarkSchema,
  addSecuritySchema,
  splitPdfSchema,
  mergePdfSchema,
  rotatePagesSchema,
  cropPagesSchema,
  jobStatusSchema,
};
