---
title: Error Handling & Monitoring
description: How errors are tracked using Sentry.
---

This project utilizes [Sentry](https://sentry.io/) for real-time error tracking and performance monitoring in both the frontend (client-side) and backend (server-side).

## Configuration

Sentry is configured through several files:

- **`astro.config.mjs`**: 
    - Integrates `@sentry/astro`.
    - Sets the `dsn` (Data Source Name) for connecting to your Sentry project.
    - Configures source map uploading (`sourceMapsUploadOptions`) using the `SENTRY_AUTH_TOKEN` environment variable. This helps Sentry display readable stack traces from minified production code.
- **`sentry.client.config.js`**: 
    - Initializes Sentry for the browser environment.
    - Configures client-side options like `tracesSampleRate` for performance monitoring and `replaysSessionSampleRate` / `replaysOnErrorSampleRate` if Sentry Session Replay is enabled.
- **`sentry.server.config.js`**: 
    - Initializes Sentry for the server environment (Astro SSR / API routes).
    - Configures server-side specific options.

## How it Works

- **Automatic Error Capturing:** The Sentry SDK automatically captures unhandled exceptions and promise rejections on both the client and server.
- **Performance Monitoring:** If configured (`tracesSampleRate` > 0), Sentry captures performance data for page loads and navigations, helping identify bottlenecks.
- **Manual Capturing:** You can manually capture errors or send custom events to Sentry using the SDK's functions (e.g., `Sentry.captureException(error)`, `Sentry.captureMessage("Something happened")`) if needed for more specific tracking.
- **Source Maps:** During the build process (when `SENTRY_AUTH_TOKEN` is available), source maps are uploaded to Sentry, allowing it to map errors from the minified/compiled code back to the original source code for easier debugging.

## Key Files

- `astro.config.mjs`: Sentry integration setup and source map config.
- `sentry.client.config.js`: Client-side Sentry initialization.
- `sentry.server.config.js`: Server-side Sentry initialization.

## Environment Variables

- `SENTRY_DSN`: Required for the SDK to send data to Sentry.
- `SENTRY_AUTH_TOKEN`: Required during build time for source map uploads. 