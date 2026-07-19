const { getRedis, isRedisAvailable } = require('../config/redis');
const logger = require('../utils/logger');

const DEFAULT_TTL = 300; // 5 minutes

const cache = {
  async get(key) {
    if (!isRedisAvailable()) return null;
    try {
      const data = await getRedis().get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.debug({ err: err.message, key }, 'Cache get error');
      return null;
    }
  },

  async set(key, value, ttl = DEFAULT_TTL) {
    if (!isRedisAvailable()) return;
    try {
      await getRedis().set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      logger.debug({ err: err.message, key }, 'Cache set error');
    }
  },

  async del(key) {
    if (!isRedisAvailable()) return;
    try {
      await getRedis().del(key);
    } catch (err) {
      logger.debug({ err: err.message, key }, 'Cache del error');
    }
  },

  async invalidatePattern(pattern) {
    if (!isRedisAvailable()) return;
    try {
      const keys = await getRedis().keys(pattern);
      if (keys.length > 0) {
        await getRedis().del(...keys);
      }
    } catch (err) {
      logger.debug({ err: err.message, pattern }, 'Cache invalidatePattern error');
    }
  },

  middleware(ttl = DEFAULT_TTL) {
    return async (req, res, next) => {
      if (!isRedisAvailable() || req.method !== 'GET') return next();

      const key = `cache:${req.user?._id || 'anon'}:${req.originalUrl}`;
      try {
        const cached = await cache.get(key);
        if (cached) {
          return res.json(cached);
        }
      } catch {}

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === 200 && body?.success !== false) {
          cache.set(key, body, ttl).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    };
  },
};

module.exports = cache;
