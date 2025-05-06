---
title: Testing Guide (Playwright)
description: Setting up and running End-to-End tests with Playwright.
---

End-to-End (E2E) testing is essential for verifying that the application works correctly from a user's perspective. CaretDB uses [Playwright](https://playwright.dev/) to automate browser interactions and test key user flows.

## Why E2E Testing?

-   **Simulates Real Users:** Tests interact with the application through a real browser (Chromium, Firefox, WebKit) just like a user would.
-   **Verifies Integration:** Checks that different parts of the application (frontend UI, API calls, potentially database interactions indirectly) work together correctly.
-   **Catches Regressions:** Helps ensure that new code changes don't break existing functionality (e.g., login, replay viewing, form submissions).

## Configuration (`playwright.config.ts`)

This root file controls Playwright's behavior:

-   **`testDir`**: Specifies the directory containing test files (e.g., `./tests` or `./e2e`).
-   **`projects`**: Defines configurations for different browsers (Chromium, Firefox, WebKit) and potentially different viewport sizes.
-   **`baseURL`**: The base URL used for navigation in tests (e.g., `page.goto('/')` goes to `baseURL`). Often configured via an environment variable (`process.env.PLAYWRIGHT_TEST_BASE_URL`) or hardcoded to a local development server URL.
-   **`webServer`**: (Optional but recommended) Configures Playwright to automatically start your Astro development server (`pnpm dev`) before running tests and shut it down afterwards. This ensures the application is running.
    ```typescript
    webServer: {
      command: 'pnpm dev', // Command to start the dev server
      url: 'http://localhost:4321', // URL to wait for
      reuseExistingServer: !process.env.CI, // Reuse server locally, start fresh in CI
    },
    ```
-   **`use`**: Default options for tests, including:
    -   `baseURL`: Sets the base URL for all tests.
    -   `trace`: Controls when to record Playwright traces (detailed action logs with snapshots). `'on-first-retry'` is common.
-   **Other Options:** Video recording (`video`), screenshot settings (`screenshot`), timeouts, etc.

## Writing Tests (`tests/` directory)

Tests are written in TypeScript (`.spec.ts` files) using Playwright's API.

-   **Structure:** Tests are typically grouped using `test.describe()` and individual test cases use `test()`.
-   **Playwright API:**
    -   `page`: The main object representing a browser page.
    -   `page.goto('/login')`: Navigates to a specific path relative to `baseURL`.
    -   `page.locator('input[name="email"]')`: Selects an element using CSS selectors or other locators.
    -   `locator.fill('user@example.com')`: Types text into an input.
    -   `locator.click()`: Clicks an element.
    -   `expect(locator).toBeVisible()`: Makes assertions about elements or page state using `expect` from `@playwright/test`.

**Example Test (`tests/auth.spec.ts` - Simplified):**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard'); // Attempt to access protected page
    // Expect redirection to the login page (adjust URL if needed)
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h1:has-text("Login")')).toBeVisible();
  });

  test('should allow login via GitHub (mocked or skipped in basic setup)', async ({ page }) => {
    // Note: Testing actual OAuth flows requires more complex setup (mocking, dedicated test users)
    // This is a placeholder showing navigation
    await page.goto('/login');
    const githubButton = page.locator('button:has-text("Sign in with GitHub")');
    await expect(githubButton).toBeVisible();
    // In a real test, you might click and handle the OAuth redirect/mocking
    // await githubButton.click();
    // ... assertions about being logged in ...
  });
});
```

## Running Tests

Use `pnpm` scripts defined in `package.json` or the Playwright CLI:

-   `pnpm test` or `pnpm test:e2e` (check `package.json`):
    -   Runs all tests found in the `testDir`.
    -   Usually runs in *headless* mode (no visible browser window), suitable for CI environments.
-   `pnpm playwright test --headed`:
    -   Runs tests with visible browser windows, helpful for observing test execution.
-   `pnpm playwright test tests/auth.spec.ts`: 
    -   Runs only the tests in a specific file.
-   `pnpm playwright test --ui`: 
    -   Opens the Playwright UI mode, a powerful tool for debugging tests step-by-step, viewing traces, and inspecting locators.

## Key Files

-   `playwright.config.ts`: Main Playwright configuration, including browser setup and web server command.
-   `tests/`: Directory containing all E2E test files (`*.spec.ts`).
-   `package.json`: Contains `pnpm` script shortcuts (like `test:e2e`) for running tests. 