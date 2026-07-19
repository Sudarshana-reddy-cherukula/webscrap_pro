const { z } = require('zod');

describe('correlationId middleware', () => {
  it('should set correlationId on request and response header', () => {
    const { correlationId } = require('../src/middlewares/correlationId');
    const req = { headers: {} };
    const res = { setHeader: vi.fn() };
    const next = vi.fn();

    correlationId(req, res, next);

    expect(req.correlationId).toBeDefined();
    expect(typeof req.correlationId).toBe('string');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', req.correlationId);
    expect(next).toHaveBeenCalled();
  });

  it('should use provided x-correlation-id header', () => {
    const { correlationId } = require('../src/middlewares/correlationId');
    const providedId = 'test-id-12345';
    const req = { headers: { 'x-correlation-id': providedId } };
    const res = { setHeader: vi.fn() };
    const next = vi.fn();

    correlationId(req, res, next);

    expect(req.correlationId).toBe(providedId);
  });
});

describe('errorMiddleware', () => {
  it('notFound should create 404 error', () => {
    const { notFound } = require('../src/middlewares/errorMiddleware');
    const req = { originalUrl: '/test' };
    const res = { status: vi.fn().mockReturnThis() };
    const next = vi.fn();

    notFound(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.message).toContain('/test');
  });

  it('asyncHandler should catch rejected promises', async () => {
    const { asyncHandler } = require('../src/middlewares/errorMiddleware');
    const handler = asyncHandler(async () => {
      throw new Error('test error');
    });

    const req = {};
    const res = {};
    const next = vi.fn();

    await handler(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].message).toBe('test error');
  });

  it('errorHandler should return structured error response', () => {
    const { errorHandler } = require('../src/middlewares/errorMiddleware');
    const error = new Error('test error');
    const req = {
      originalUrl: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: () => 'test-agent',
      correlationId: 'abc-123',
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorHandler(error, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalled();
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.correlationId).toBe('abc-123');
  });
});

describe('validationMiddleware (Joi)', () => {
  it('validateRequest should pass valid body', () => {
    const { validateRequest } = require('../src/middlewares/validationMiddleware');
    const Joi = require('joi');
    const schema = Joi.object({ name: Joi.string().required() });
    const middleware = validateRequest(schema);

    const req = { body: { name: 'test' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('validateRequest should reject invalid body', async () => {
    const { validateRequest } = require('../src/middlewares/validationMiddleware');
    const Joi = require('joi');
    const schema = Joi.object({ name: Joi.string().required() });
    const middleware = validateRequest(schema);

    const req = { body: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('validationMiddleware (Zod)', () => {
  it('validateZod should pass valid body', () => {
    const { validateZod } = require('../src/middlewares/validationMiddleware');
    const schema = z.object({ name: z.string() });
    const middleware = validateZod(schema);

    const req = { body: { name: 'test' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('validateZod should reject invalid body', async () => {
    const { validateZod } = require('../src/middlewares/validationMiddleware');
    const schema = z.object({ name: z.string().min(3) });
    const middleware = validateZod(schema);

    const req = { body: { name: 'ab' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('logger', () => {
  it('should export a pino logger instance', () => {
    const logger = require('../src/utils/logger');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });
});
