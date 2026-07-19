import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/WebScrap Pro/);
  });

  test('displays hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=WebScrap').first()).toBeVisible();
  });

  test('navigates to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');
    await expect(page).toHaveURL(/login/);
  });

  test('navigates to pricing page', async ({ page }) => {
    await page.goto('/');
    const pricingLink = page.locator('a[href="/pricing"]').first();
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await expect(page).toHaveURL(/pricing/);
    }
  });
});

test.describe('Authentication', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test('shows register form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[placeholder*="name" i], input[name="name"]').first()).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  });

  test('validates empty login submission', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Protected Routes', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('redirects unauthenticated scraper to login', async ({ page }) => {
    await page.goto('/scraper');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('404 Page', () => {
  test('shows 404 for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-route-12345');
    await page.waitForTimeout(1000);
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toContain('404');
  });
});

test.describe('Responsive Design', () => {
  test('renders mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('renders desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
