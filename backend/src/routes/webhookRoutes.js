const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createWebhook,
  getWebhooks,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  toggleWebhook,
  testWebhook,
} = require('../controllers/webhookController');

router.use(protect);

router.post('/', createWebhook);
router.get('/', getWebhooks);
router.get('/:id', getWebhook);
router.put('/:id', updateWebhook);
router.delete('/:id', deleteWebhook);
router.post('/:id/toggle', toggleWebhook);
router.post('/:id/test', testWebhook);

module.exports = router;
