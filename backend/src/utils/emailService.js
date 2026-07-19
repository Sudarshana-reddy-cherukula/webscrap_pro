const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn('SMTP not configured — emails will be logged only');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || 587,
    secure: (SMTP_PORT || 587) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
};

const sendViaN8n = async ({ to, subject, template, data }) => {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nUrl) return false;

  try {
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, template, data }),
    });

    if (!response.ok) throw new Error(`n8n responded with ${response.status}`);
    logger.info({ to, subject, template }, 'Email sent via n8n');
    return true;
  } catch (error) {
    logger.error({ to, subject, error: error.message }, 'n8n email failed, falling back to SMTP');
    return false;
  }
};

const sendEmail = async ({ to, subject, html, text, template, data }) => {
  const from = process.env.EMAIL_FROM || 'WebScrap Pro <no-reply@webscrappro.io>';

  // Try n8n first if configured
  if (process.env.N8N_WEBHOOK_URL && template) {
    const sent = await sendViaN8n({ to, subject, template, data });
    if (sent) return { success: true, via: 'n8n' };
  }

  // Fallback to SMTP
  const mailOptions = { from, to, subject, html, text };

  try {
    const transport = getTransporter();
    if (!transport) {
      logger.info({ to, subject }, 'Email (SMTP not configured, logged only)');
      return { success: true, simulated: true };
    }

    const info = await transport.sendMail(mailOptions);
    logger.info({ to, subject, messageId: info.messageId }, 'Email sent via SMTP');
    return { success: true, messageId: info.messageId, via: 'smtp' };
  } catch (error) {
    logger.error({ to, subject, error: error.message }, 'Email send failed');
    throw error;
  }
};

const templates = {
  otp: (name, otp) => ({
    subject: 'Your WebScrap Pro Verification Code',
    template: 'otp',
    data: { name, otp },
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#d97706;text-align:center;">WebScrap Pro</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Your verification code is:</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1f2937;background:#fef3c7;padding:12px 24px;border-radius:8px;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Your WebScrap Pro verification code is: ${otp}`,
  }),

  jobComplete: (name, jobType, result) => ({
    subject: `Your ${jobType} job is complete`,
    template: 'job-complete',
    data: { name, jobType, result },
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#d97706;text-align:center;">WebScrap Pro</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Your <strong>${jobType}</strong> job has completed successfully.</p>
        <p style="color:#6b7280;font-size:13px;">Log in to your dashboard to view the results.</p>
      </div>
    `,
    text: `Hi ${name}, your ${jobType} job is complete. Log in to view results.`,
  }),

  welcome: (name) => ({
    subject: 'Welcome to WebScrap Pro!',
    template: 'welcome',
    data: { name },
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#d97706;text-align:center;">Welcome to WebScrap Pro!</h2>
        <p>Hi ${name},</p>
        <p>Your account has been created successfully. Start by creating your first scraping job or uploading a PDF.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://webscrap-pro-ecru.vercel.app'}/dashboard" style="background:linear-gradient(135deg,#d97706,#ea580c);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
        </div>
      </div>
    `,
    text: `Welcome to WebScrap Pro, ${name}! Your account is ready.`,
  }),
};

module.exports = { sendEmail, templates };
