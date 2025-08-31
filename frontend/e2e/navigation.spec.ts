import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should display the main navigation elements', async ({ page }) => {
    // Check for the main brand/logo
    await expect(page.getByText('ComplianceScanner AI')).toBeVisible();
    
    // Check for the Alpha badge
    await expect(page.getByText('Alpha')).toBeVisible();
  });

  test('should have responsive mobile header', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")').first();
    await expect(menuButton).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    // Click on dashboard link or navigate directly
    await page.goto('/dashboard');
    
    // Check for dashboard content
    await expect(page.getByText(/Welcome back/)).toBeVisible();
    await expect(page.getByText('Quick Scan')).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/projects');
    
    // Check for projects page content
    await expect(page.getByText(/Your Projects/)).toBeVisible();
  });

  test('should navigate to scans page', async ({ page }) => {
    await page.goto('/scans');
    
    // Check for scans page content
    await expect(page.getByText(/Recent Scans/)).toBeVisible();
  });

  test('should navigate to monitoring page', async ({ page }) => {
    await page.goto('/monitoring');
    
    // Check for monitoring page content
    await expect(page.getByText(/Monitoring/)).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/settings');
    
    // Check for settings page content
    await expect(page.getByText(/Settings/)).toBeVisible();
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Check for 404 content
    await expect(page.getByText(/404/)).toBeVisible();
  });
});
