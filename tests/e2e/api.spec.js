import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('GET /api/health returns status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
  });
});

test.describe('API Index', () => {
  test('GET /api returns endpoints list', async ({ request }) => {
    const response = await request.get('/api');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.endpoints).toBeDefined();
  });
});

test.describe('Auth Endpoints', () => {
  test('POST /api/auth/register validates required fields', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {},
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/auth/login validates required fields', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {},
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Scraping Endpoints', () => {
  test('GET /api/scrape/jobs requires auth', async ({ request }) => {
    const response = await request.get('/api/scrape/jobs');
    expect(response.status()).toBe(401);
  });
});

test.describe('Settings Endpoints', () => {
  test('GET /api/settings/security requires auth', async ({ request }) => {
    const response = await request.get('/api/settings/security');
    expect(response.status()).toBe(401);
  });
});

test.describe('404 Handler', () => {
  test('returns 404 for unknown API routes', async ({ request }) => {
    const response = await request.get('/api/nonexistent');
    expect(response.status()).toBe(404);
  });
});
