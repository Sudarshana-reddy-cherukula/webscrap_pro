const { getRedis, isRedisAvailable } = require('../config/redis');
const { asyncHandler } = require('./errorMiddleware');
const logger = require('../utils/logger');

const PLANS = {
  free: { requests: 50, window: 3600 },
  starter: { requests: 200, window: 3600 },
  pro: { requests: 1000, window: 3600 },
  enterprise: { requests: 10000, window: 3600 },
};

function perUserRateLimit(options = {}) {
  const { windowSeconds = 3600, maxRequests = null } = options;

  return asyncHandler(async (req, res, next) => {
    if (!isRedisAvailable() || !req.user?._id) return next();

    const plan = req.user.plan || 'free';
    const limit = maxRequests || PLANS[plan]?.requests || PLANS.free.requests;
    const window = PLANS[plan]?.window || windowSeconds;

    const key = `ratelimit:user:${req.user._id}`;

    try {
      const redis = getRedis();
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, window);
      }

      const ttl = await redis.ttl(key);
      const remaining = Math.max(0, limit - current);

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', ttl);

      if (current > limit) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Upgrade your plan for more requests.',
          retryAfter: ttl,
        });
      }
    } catch (err) {
      logger.debug({ err: err.message }, 'Rate limit check failed — allowing request');
    }

    next();
  });
}

module.exports = { perUserRateLimit, PLANS };
