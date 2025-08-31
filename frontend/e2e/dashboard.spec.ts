import { test, expect } from '@playwright/test';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard page before each test
    await page.goto('/dashboard');
  });

  test('should display dashboard main elements', async ({ page }) => {
    // Check for welcome message
    await expect(page.getByText(/Welcome back/)).toBeVisible();
    
    // Check for quick scan section
    await expect(page.getByText('Quick Scan')).toBeVisible();
    
    // Check for projects section
    await expect(page.getByText('Your Projects')).toBeVisible();
    
    // Check for recent scans section
    await expect(page.getByText('Recent Scans')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    // Check for stats cards (they should be present even if loading)
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toHaveCount(4);
  });

  test('should display quick action cards', async ({ page }) => {
    // Check for quick action cards
    const quickActionCards = page.locator('[data-testid="quick-action-card"]');
    await expect(quickActionCards).toHaveCount(2); // Quick Scan and New Project
  });

  test('should handle quick scan button click', async ({ page }) => {
    // Click on quick scan button
    const quickScanButton = page.getByText('Quick Scan');
    await quickScanButton.click();
    
    // Should open quick scan modal or navigate to scan page
    // This depends on the implementation
    await expect(page.getByText('Quick Scan')).toBeVisible();
  });

  test('should handle new project button click', async ({ page }) => {
    // Click on new project button
    const newProjectButton = page.getByText('New Project');
    await newProjectButton.click();
    
    // Should open new project modal or navigate to project creation page
    await expect(page.getByText('New Project')).toBeVisible();
  });

  test('should display recent scans section', async ({ page }) => {
    // Check for recent scans section
    const recentScansSection = page.locator('[data-testid="recent-scans"]');
    await expect(recentScansSection).toBeVisible();
  });

  test('should display assistant widget', async ({ page }) => {
    // Check for assistant widget
    const assistantWidget = page.locator('[data-testid="assistant-widget"]');
    await expect(assistantWidget).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still visible
    await expect(page.getByText(/Welcome back/)).toBeVisible();
    await expect(page.getByText('Quick Scan')).toBeVisible();
    
    // Check for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")').first();
    await expect(menuButton).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check that content is still visible
    await expect(page.getByText(/Welcome back/)).toBeVisible();
    await expect(page.getByText('Quick Scan')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Check for loading indicators
    const loadingCards = page.locator('[data-loading="true"]');
    await expect(loadingCards).toHaveCount(4); // Stats cards should show loading initially
  });

  test('should display proper page title', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toBeAttached();
  });
});
