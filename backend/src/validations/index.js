const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('./authValidation');

const {
  scrapeUrlSchema,
  scrapeImagesSchema,
  scrapeLinksSchema,
  scrapeMetadataSchema,
  jobStatusSchema,
} = require('./scrapingValidation');

const {
  extractTextSchema,
  extractImagesSchema,
  extractMetadataSchema,
  convertToDocxSchema,
  convertToTxtSchema,
} = require('./pdfValidation');

const {
  exportSchema,
  exportStatusSchema,
  paginationSchema,
} = require('./exportValidation');

module.exports = {
  // Auth validations
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  
  // Scraping validations
  scrapeUrlSchema,
  scrapeImagesSchema,
  scrapeLinksSchema,
  scrapeMetadataSchema,
  jobStatusSchema,
  
  // PDF validations
  extractTextSchema,
  extractImagesSchema,
  extractMetadataSchema,
  convertToDocxSchema,
  convertToTxtSchema,
  
  // Export validations
  exportSchema,
  exportStatusSchema,
  paginationSchema,
};
