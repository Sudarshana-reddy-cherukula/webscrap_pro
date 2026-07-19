const { envSchema } = require('../src/config/env');

describe('envSchema', () => {
  const validEnv = {
    NODE_ENV: 'development',
    PORT: '5000',
    MONGO_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/db',
    JWT_SECRET: 'a'.repeat(32),
    LOG_LEVEL: 'info',
  };

  it('should parse valid environment variables', () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
    expect(result.data.PORT).toBe(5000);
    expect(result.data.JWT_SECRET).toBe('a'.repeat(32));
  });

  it('should reject missing MONGO_URI', () => {
    const { MONGO_URI, ...rest } = validEnv;
    const result = envSchema.safeParse(rest);
    expect(result.success).toBe(false);
    expect(result.error.issues.some(i => i.path.includes('MONGO_URI'))).toBe(true);
  });

  it('should reject short JWT_SECRET', () => {
    const result = envSchema.safeParse({ ...validEnv, JWT_SECRET: 'short' });
    expect(result.success).toBe(false);
    expect(result.error.issues.some(i => i.path.includes('JWT_SECRET'))).toBe(true);
  });

  it('should coerce PORT to number', () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: '3000' });
    expect(result.success).toBe(true);
    expect(result.data.PORT).toBe(3000);
  });

  it('should reject invalid NODE_ENV', () => {
    const result = envSchema.safeParse({ ...validEnv, NODE_ENV: 'staging' });
    expect(result.success).toBe(false);
  });

  it('should allow optional REDIS_URL', () => {
    const result = envSchema.safeParse({ ...validEnv, REDIS_URL: 'redis://localhost:6379' });
    expect(result.success).toBe(true);
    expect(result.data.REDIS_URL).toBe('redis://localhost:6379');
  });

  it('should allow missing REDIS_URL', () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
    expect(result.data.REDIS_URL).toBeUndefined();
  });
});
