const workflowService = require('../services/workflowService');
const webhookService = require('../services/webhookService');
const logger = require('../utils/logger');

class WebhookService {
  async trigger(userId, event, data) {
    const Webhook = require('../models/Webhook');
    const crypto = require('crypto');

    const webhooks = await Webhook.find({ userId, enabled: true, events: event });

    for (const webhook of webhooks) {
      try {
        const payload = JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        });

        const signature = crypto.createHmac('sha256', webhook.secret || '').update(payload).digest('hex');

        const axios = require('axios');
        await axios.post(webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
            ...webhook.headers,
          },
          timeout: 10000,
        });

        webhook.lastTriggered = new Date();
        webhook.lastStatus = 200;
        webhook.failureCount = 0;
        await webhook.save();

        logger.info(`Webhook triggered: ${webhook.name} for event ${event}`);
      } catch (error) {
        webhook.failureCount = (webhook.failureCount || 0) + 1;
        webhook.lastStatus = error.response?.status || 0;
        await webhook.save();

        logger.error(`Webhook failed: ${webhook.name} - ${error.message}`);

        if (webhook.failureCount >= 10) {
          webhook.enabled = false;
          await webhook.save();
          logger.warn(`Webhook ${webhook.name} disabled after 10 consecutive failures`);
        }
      }
    }
  }
}

module.exports = new WebhookService();
