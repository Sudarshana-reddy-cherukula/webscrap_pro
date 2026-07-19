const crypto = require('crypto');

const CORRELATION_ID_HEADER = 'x-correlation-id';

const correlationId = (req, res, next) => {
  const id = req.headers[CORRELATION_ID_HEADER] || crypto.randomUUID();
  req.correlationId = id;
  res.setHeader(CORRELATION_ID_HEADER, id);
  next();
};

module.exports = { correlationId, CORRELATION_ID_HEADER };
