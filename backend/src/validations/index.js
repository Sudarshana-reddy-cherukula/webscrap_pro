const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
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
  modifyTextSchema,
  addWatermarkSchema,
  addSecuritySchema,
  splitPdfSchema,
  mergePdfSchema,
  rotatePagesSchema,
  cropPagesSchema,
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
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  
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
  modifyTextSchema,
  addWatermarkSchema,
  addSecuritySchema,
  splitPdfSchema,
  mergePdfSchema,
  rotatePagesSchema,
  cropPagesSchema,
  
  // Export validations
  exportSchema,
  exportStatusSchema,
  paginationSchema,
};
