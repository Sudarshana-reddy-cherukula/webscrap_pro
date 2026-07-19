const Webhook = require('../models/Webhook');
const webhookService = require('../services/webhookService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const createWebhook = asyncHandler(async (req, res) => {
  const { name, url, events, headers } = req.body;
  if (!name || !url) {
    return res.status(400).json({ success: false, message: 'Name and URL are required' });
  }
  const webhook = await Webhook.create({
    userId: req.user._id,
    name,
    url,
    events: events || [],
    headers: headers || {},
  });
  res.status(201).json({ success: true, data: webhook });
});

const getWebhooks = asyncHandler(async (req, res) => {
  const webhooks = await Webhook.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: webhooks });
});

const getWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({ _id: req.params.id, userId: req.user._id });
  if (!webhook) {
    return res.status(404).json({ success: false, message: 'Webhook not found' });
  }
  res.json({ success: true, data: webhook });
});

const updateWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!webhook) {
    return res.status(404).json({ success: false, message: 'Webhook not found' });
  }
  res.json({ success: true, data: webhook });
});

const deleteWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!webhook) {
    return res.status(404).json({ success: false, message: 'Webhook not found' });
  }
  res.json({ success: true, message: 'Webhook deleted' });
});

const toggleWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({ _id: req.params.id, userId: req.user._id });
  if (!webhook) {
    return res.status(404).json({ success: false, message: 'Webhook not found' });
  }
  webhook.enabled = !webhook.enabled;
  await webhook.save();
  res.json({ success: true, data: webhook });
});

const testWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({ _id: req.params.id, userId: req.user._id });
  if (!webhook) {
    return res.status(404).json({ success: false, message: 'Webhook not found' });
  }

  try {
    const crypto = require('crypto');
    const axios = require('axios');
    const payload = JSON.stringify({
      event: 'webhook.test',
      data: { message: 'Test webhook delivery', webhookId: webhook._id },
      timestamp: new Date().toISOString(),
    });
    const signature = crypto.createHmac('sha256', webhook.secret || '').update(payload).digest('hex');

    const response = await axios.post(webhook.url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': 'webhook.test',
        ...webhook.headers,
      },
      timeout: 10000,
    });

    webhook.lastTriggered = new Date();
    webhook.lastStatus = response.status;
    await webhook.save();

    res.json({ success: true, data: { status: response.status, message: 'Webhook test delivered' } });
  } catch (error) {
    webhook.lastStatus = error.response?.status || 0;
    await webhook.save();
    res.status(400).json({ success: false, message: `Webhook test failed: ${error.message}` });
  }
});

module.exports = {
  createWebhook,
  getWebhooks,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  toggleWebhook,
  testWebhook,
};
