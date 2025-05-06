---
title: Testing
description: How End-to-End (E2E) testing is set up using Playwright.
---

This project uses [Playwright](https://playwright.dev/) for End-to-End (E2E) testing, which allows testing the application in real browsers.

## Configuration

- **`playwright.config.ts`**: This file at the root of the project configures Playwright.
    - Defines the browsers to test against (e.g., Chromium, Firefox, WebKit).
    - Sets the base URL for tests (often configured via environment variable or hardcoded for local development).
    - Configures test directories (usually `tests/` or `e2e/`).
    - Specifies options like trace recording (`on-first-retry`), video recording, and screenshot settings.
    - May include setup for running the development server before tests.
- **`tests/` directory**: Contains the actual test files (e.g., `example.spec.ts`). Test files use Playwright's API to interact with the browser (navigate, click elements, assert conditions).

## Running Tests

Tests are typically run using commands defined in `package.json` or directly via the Playwright CLI.

- **Common commands (check `package.json`):**
    - `pnpm test` or `pnpm test:e2e`: Runs all tests.
    - `pnpm test:e2e:ui`: Opens the Playwright UI mode for debugging tests.
    - `pnpm playwright test --headed`: Runs tests in headed mode (visible browser window).

## Key Concepts

- **E2E Testing:** Simulates real user interactions by controlling a browser and verifying application behavior from start to finish.
- **Playwright API:** Provides functions to launch browsers, open pages, find elements (`page.locator()`), perform actions (`click()`, `fill()`, `press()`), and make assertions (`expect()`).

## Key Files

- `playwright.config.ts`: Main Playwright configuration.
- `tests/`: Directory containing test specification files.
- `package.json`: Often contains script shortcuts for running tests. 