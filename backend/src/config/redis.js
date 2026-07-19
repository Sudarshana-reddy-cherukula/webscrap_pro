const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;
let isAvailable = false;

function createRedisConnection() {
  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn('REDIS_URL not set — Redis features disabled');
    return null;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 5) {
        logger.error('Redis: max reconnection attempts reached');
        return null;
      }
      return Math.min(times * 200, 5000);
    },
    lazyConnect: true,
  });

  client.on('connect', () => {
    isAvailable = true;
    logger.info('Redis connected');
  });

  client.on('error', (err) => {
    isAvailable = false;
    logger.error({ err: err.message }, 'Redis error');
  });

  client.on('close', () => {
    isAvailable = false;
    logger.warn('Redis connection closed');
  });

  return client;
}

async function connectRedis() {
  redis = createRedisConnection();
  if (!redis) return null;

  try {
    await redis.connect();
    return redis;
  } catch (err) {
    logger.error({ err: err.message }, 'Redis connection failed — running without cache');
    redis = null;
    return null;
  }
}

async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    isAvailable = false;
  }
}

function getRedis() {
  return redis;
}

function isRedisAvailable() {
  return isAvailable && redis !== null;
}

module.exports = {
  createRedisConnection,
  connectRedis,
  disconnectRedis,
  getRedis,
  isRedisAvailable,
};
