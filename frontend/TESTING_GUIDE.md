# 🧪 Testing Guide

This guide covers all aspects of testing in the ComplianceScanner AI frontend application.

## 📋 Table of Contents

- [Overview](#overview)
- [Unit Tests (Jest + React Testing Library)](#unit-tests)
- [E2E Tests (Playwright)](#e2e-tests)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Our testing strategy includes:

- **Unit Tests**: Component and utility testing with Jest + React Testing Library
- **E2E Tests**: End-to-end testing with Playwright
- **Accessibility Tests**: Automated a11y testing
- **Performance Tests**: Basic performance monitoring

## 🧩 Unit Tests

### Setup

We use Jest with React Testing Library for unit testing:

```bash
# Install dependencies (already done)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# Run tests
npm test
npm run test:watch
npm run test:coverage
```

### Test Structure

```
src/
├── components/
│   ├── __tests__/
│   │   ├── Layout.test.tsx
│   │   ├── Sidebar.test.tsx
│   │   ├── StatsCard.test.tsx
│   │   ├── ProjectCard.test.tsx
│   │   ├── QuickActionCard.test.tsx
│   │   └── RecentScans.test.tsx
│   └── ...
├── utils/
│   └── __tests__/
│       ├── logger.test.ts
│       └── simple.test.ts
└── app/
    └── __tests__/
        └── dashboard.test.tsx
```

### Configuration Files

- `jest.config.js` - Jest configuration
- `jest.setup.js` - Global test setup and mocks

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPatterns=Layout.test.tsx

# Run tests matching pattern
npm test -- --testPathPatterns="(Sidebar|StatsCard)"
```

### Test Coverage

Current coverage targets:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🌐 E2E Tests

### Setup

We use Playwright for end-to-end testing:

```bash
# Install Playwright (already done)
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e
```

### Test Structure

```
e2e/
├── navigation.spec.ts
├── dashboard.spec.ts
└── accessibility.spec.ts
```

### Configuration

- `playwright.config.ts` - Playwright configuration
- Supports multiple browsers (Chrome, Firefox, Safari)
- Mobile and desktop viewports
- Automatic dev server startup

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report

# Run specific test file
npx playwright test e2e/navigation.spec.ts

# Run specific browser
npx playwright test --project=chromium
```

## 🏃‍♂️ Running Tests

### Quick Start

```bash
# Run all unit tests
npm test

# Run all E2E tests
npm run test:e2e

# Run both (in separate terminals)
npm test & npm run test:e2e
```

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Run Unit Tests
  run: npm test

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## ✍️ Writing Tests

### Unit Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    render(<MyComponent />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should navigate to dashboard', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByText('Welcome')).toBeVisible()
})
```

### Test Naming Conventions

- **Unit Tests**: `ComponentName.test.tsx` or `functionName.test.ts`
- **E2E Tests**: `feature.spec.ts`
- **Test Descriptions**: Use descriptive names that explain the behavior

### Testing Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Test Behavior, Not Implementation**: Focus on what users see/do
3. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
4. **Keep Tests Independent**: Each test should be able to run alone
5. **Mock External Dependencies**: Don't test third-party libraries

## 🎯 Best Practices

### Unit Testing

- Test component rendering
- Test user interactions
- Test error states
- Test loading states
- Test accessibility features
- Mock external dependencies

### E2E Testing

- Test critical user journeys
- Test responsive behavior
- Test accessibility
- Test error handling
- Test performance basics

### Accessibility Testing

- Test keyboard navigation
- Test screen reader compatibility
- Test color contrast
- Test ARIA attributes
- Test focus management

## 🔧 Troubleshooting

### Common Issues

1. **Module Resolution Errors**
   ```bash
   # Check jest.config.js moduleNameMapping
   # Use relative paths in test files
   ```

2. **Async Test Failures**
   ```typescript
   // Use waitFor for async operations
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument()
   })
   ```

3. **Mock Issues**
   ```typescript
   // Reset mocks between tests
   beforeEach(() => {
     jest.clearAllMocks()
   })
   ```

4. **E2E Timeout Issues**
   ```typescript
   // Increase timeout for slow operations
   await page.waitForSelector('.slow-element', { timeout: 10000 })
   ```

### Debug Commands

```bash
# Debug unit tests
npm test -- --verbose --no-coverage

# Debug E2E tests
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

## 📊 Test Reports

### Coverage Reports

After running `npm run test:coverage`, view the report:
- HTML report: `coverage/lcov-report/index.html`
- Console summary in terminal

### E2E Reports

After running E2E tests:
- HTML report: `playwright-report/index.html`
- Screenshots: `test-results/`
- Videos: `test-results/`

## 🚀 Performance Testing

### Basic Performance Checks

```typescript
test('should load within performance budget', async ({ page }) => {
  const startTime = Date.now()
  await page.goto('/dashboard')
  const loadTime = Date.now() - startTime
  
  expect(loadTime).toBeLessThan(3000) // 3 seconds
})
```

### Lighthouse Integration

```bash
# Install lighthouse
npm install --save-dev lighthouse

# Run lighthouse tests
npx lighthouse http://localhost:3000 --output html
```

## 📝 Adding New Tests

### For New Components

1. Create test file: `src/components/__tests__/NewComponent.test.tsx`
2. Import and test the component
3. Add to test suite
4. Update coverage targets if needed

### For New Pages

1. Create E2E test: `e2e/newpage.spec.ts`
2. Test navigation and functionality
3. Test responsive behavior
4. Test accessibility

### For New Features

1. Add unit tests for components
2. Add E2E tests for user flows
3. Update existing tests if needed
4. Document new test patterns

## 🤝 Contributing

When adding new tests:

1. Follow existing patterns
2. Use descriptive test names
3. Add comments for complex tests
4. Update this guide if needed
5. Ensure tests pass before committing

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Accessibility Testing](https://www.w3.org/WAI/ER/tools/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
