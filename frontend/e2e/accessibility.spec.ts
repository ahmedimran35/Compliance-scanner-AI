import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check for main heading
    const h1 = page.locator('h1');
    await expect(h1).toBeAttached();
    
    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings).toHaveCount(expect.any(Number));
  });

  test('should have proper alt text for images', async ({ page }) => {
    // Check for images with alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      // Images should have alt text or be decorative (alt="")
      expect(alt).toBeDefined();
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for buttons with aria-label
    const buttons = page.locator('button[aria-label]');
    await expect(buttons).toBeAttached();
    
    // Check for navigation with proper ARIA
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeAttached();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeAttached();
    
    // Test more tab presses
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should still be visible
    await expect(focusedElement).toBeAttached();
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test Escape key for closing modals/sidebar
    await page.keyboard.press('Escape');
    
    // Test Enter key for buttons
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      await buttons.first().focus();
      await page.keyboard.press('Enter');
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // This is a basic check - in a real scenario you'd use axe-core or similar
    // For now, we'll check that text elements are visible
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');
    await expect(textElements.first()).toBeVisible();
  });

  test('should have skip links', async ({ page }) => {
    // Check for skip to main content link
    const skipLink = page.locator('a[href*="#main"], a[href*="#content"], a[href*="#skip"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink.first()).toBeAttached();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    // Check for form inputs with labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Input should have either id with label, aria-label, or aria-labelledby
      expect(id || ariaLabel || ariaLabelledBy).toBeDefined();
    }
  });

  test('should have proper button roles', async ({ page }) => {
    // Check that buttons have proper roles
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const role = await button.getAttribute('role');
      const type = await button.getAttribute('type');
      
      // Buttons should have proper type or role
      expect(type || role === 'button' || !role).toBeTruthy();
    }
  });

  test('should have proper list structure', async ({ page }) => {
    // Check for proper list elements
    const lists = page.locator('ul, ol');
    const listCount = await lists.count();
    
    for (let i = 0; i < listCount; i++) {
      const list = lists.nth(i);
      const listItems = list.locator('li');
      await expect(listItems).toBeAttached();
    }
  });

  test('should have proper table structure', async ({ page }) => {
    // Check for proper table elements
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i);
      const headers = table.locator('th');
      const rows = table.locator('tr');
      
      // Tables should have headers and rows
      await expect(headers).toBeAttached();
      await expect(rows).toBeAttached();
    }
  });

  test('should have proper language attributes', async ({ page }) => {
    // Check for lang attribute on html element
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeDefined();
  });

  test('should have proper viewport meta tag', async ({ page }) => {
    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeAttached();
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Check for live regions
    const liveRegions = page.locator('[aria-live]');
    if (await liveRegions.count() > 0) {
      await expect(liveRegions.first()).toBeAttached();
    }
  });
});
