const crypto = require('crypto');

const etagMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    if (req.method === 'GET' && body && typeof body === 'object') {
      const etag = `"${crypto.createHash('md5').update(JSON.stringify(body)).digest('hex')}"`;
      res.setHeader('ETag', etag);

      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        return res.status(304).end();
      }

      res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    }
    return originalJson(body);
  };

  next();
};

module.exports = etagMiddleware;
