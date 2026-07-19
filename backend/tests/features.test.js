describe('cache utility', () => {
  it('should export cache methods', () => {
    const cache = require('../src/utils/cache');
    expect(typeof cache.get).toBe('function');
    expect(typeof cache.set).toBe('function');
    expect(typeof cache.del).toBe('function');
    expect(typeof cache.invalidatePattern).toBe('function');
    expect(typeof cache.middleware).toBe('function');
  });

  it('should return null when Redis is unavailable', async () => {
    const cache = require('../src/utils/cache');
    const result = await cache.get('test-key');
    expect(result).toBeNull();
  });

  it('should return noop middleware when Redis is unavailable', () => {
    const cache = require('../src/utils/cache');
    const middleware = cache.middleware();
    expect(typeof middleware).toBe('function');
  });
});

describe('storage utility', () => {
  it('should export storage methods', () => {
    const storage = require('../src/utils/storage');
    expect(typeof storage.uploadFile).toBe('function');
    expect(typeof storage.getSignedDownloadUrl).toBe('function');
    expect(typeof storage.deleteFile).toBe('function');
    expect(typeof storage.isS3Configured).toBe('function');
  });

  it('should report S3 as not configured', () => {
    const storage = require('../src/utils/storage');
    expect(storage.isS3Configured()).toBe(false);
  });
});

describe('queue config', () => {
  it('should export queue methods', () => {
    const queue = require('../src/config/queue');
    expect(typeof queue.getScrapeQueue).toBe('function');
    expect(typeof queue.getPdfQueue).toBe('function');
    expect(typeof queue.closeQueues).toBe('function');
    expect(queue.QUEUE_NAMES.SCRAPE).toBe('scrape-jobs');
    expect(queue.QUEUE_NAMES.PDF).toBe('pdf-jobs');
  });

  it('should return null when Redis is unavailable', () => {
    const queue = require('../src/config/queue');
    const q = queue.getScrapeQueue();
    expect(q).toBeNull();
  });
});

describe('redis config', () => {
  it('should export redis methods', () => {
    const redis = require('../src/config/redis');
    expect(typeof redis.connectRedis).toBe('function');
    expect(typeof redis.disconnectRedis).toBe('function');
    expect(typeof redis.getRedis).toBe('function');
    expect(typeof redis.isRedisAvailable).toBe('function');
  });

  it('should report Redis as unavailable when not connected', () => {
    const redis = require('../src/config/redis');
    expect(redis.isRedisAvailable()).toBe(false);
  });
});

describe('rate limit middleware', () => {
  it('should export perUserRateLimit', () => {
    const rl = require('../src/middlewares/rateLimitMiddleware');
    expect(typeof rl.perUserRateLimit).toBe('function');
    expect(rl.PLANS).toBeDefined();
    expect(rl.PLANS.free).toBeDefined();
    expect(rl.PLANS.pro).toBeDefined();
  });

  it('should skip rate limiting when Redis is unavailable', async () => {
    const rl = require('../src/middlewares/rateLimitMiddleware');
    const middleware = rl.perUserRateLimit();
    const req = { user: { _id: '123', plan: 'free' } };
    const res = { setHeader: vi.fn() };
    const next = vi.fn();
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
