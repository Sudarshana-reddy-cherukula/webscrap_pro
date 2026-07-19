const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

router.use('/', swaggerUi.serveFiles(swaggerSpec, {}), swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'WebScrap Pro API Docs',
}));

router.get('/json', (req, res) => {
  res.json(swaggerSpec);
});

module.exports = router;
