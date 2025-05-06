---
title: Error Handling & Monitoring (Sentry)
description: Utilizing Sentry for robust error tracking and performance monitoring.
---

Effective error handling and performance monitoring are crucial for maintaining a stable and performant application. CaretDB integrates with [Sentry](https://sentry.io/), a popular platform for real-time error tracking, performance monitoring, and session replay analysis (though this project primarily uses Sentry for errors/performance).

## Why Sentry?

-   **Real-time Alerts:** Get notified immediately when errors occur in production.
-   **Detailed Context:** Sentry captures stack traces, browser/OS details, user context (if available), and breadcrumbs (sequences of events leading up to an error).
-   **Source Map Support:** Maps minified production code back to your original source, making debugging significantly easier.
-   **Performance Monitoring:** Helps identify slow page loads, API requests, and other performance bottlenecks.
-   **Unified Platform:** Tracks both frontend (client-side) and backend (server-side) errors in one place.

## Configuration Deep Dive

Sentry integration is managed via the `@sentry/astro` package and configured in these key files:

1.  **`astro.config.mjs`:**
    -   Imports and adds the `sentry()` integration.
    -   Sets the `dsn` (Data Source Name): This unique URL tells the Sentry SDK where to send event data. Find this in your Sentry project settings (Project Settings > Client Keys (DSN)). It's loaded from the `SENTRY_DSN` environment variable.
    -   Configures `sourceMapsUploadOptions`:
        -   `project`: Your Sentry project slug.
        -   `authToken`: Loaded from the `SENTRY_AUTH_TOKEN` environment variable. This is an auth token generated in Sentry (User Settings > Auth Tokens) that allows the build process (e.g., on Vercel) to securely upload source maps.

2.  **`sentry.client.config.js`:**
    -   Initializes Sentry specifically for the browser environment.
    -   `integrations`: Can include integrations like `BrowserTracing` for performance or `Replay` if using Sentry's session replay.
    -   `tracesSampleRate`: Controls what percentage of transactions (e.g., page loads) are sent for performance monitoring. `1.0` means 100%, `0.1` means 10%. Start lower in high-traffic apps.
    -   `replaysSessionSampleRate` / `replaysOnErrorSampleRate`: Control sampling if using Sentry Replay.

3.  **`sentry.server.config.js`:**
    -   Initializes Sentry for the Node.js server environment (used by Astro SSR and API routes).
    -   Also configures `tracesSampleRate` for backend transaction monitoring.

## How Errors are Captured

-   **Automatic:** The Sentry SDK automatically hooks into the browser and Node.js environments to capture:
    -   Unhandled JavaScript exceptions (e.g., `TypeError`, `ReferenceError`).
    -   Unhandled promise rejections.
    -   Errors occurring during Astro server-side rendering or within API routes.
-   **Manual:** For more granular control or capturing specific application states, you can use the SDK directly:
    ```javascript
    import * as Sentry from "@sentry/astro";

    try {
      // Some operation that might fail
      riskyOperation();
    } catch (error) {
      Sentry.captureException(error, {
        tags: { section: "data-processing" },
        extra: { relevantData: someData },
      });
    }

    // Capture informational messages
    Sentry.captureMessage("User started the import process.", "info");
    ```

## The Importance of Source Maps

When your code runs in production, it's usually minified and bundled. If an error occurs, the stack trace points to lines in this unreadable code.

By enabling `sourceMapsUploadOptions` in `astro.config.mjs` and providing a `SENTRY_AUTH_TOKEN` during the build (especially in your deployment environment like Vercel), Astro's build process will generate source maps and upload them to Sentry. Sentry then uses these maps to translate the cryptic stack traces back into your original, readable source code within the Sentry UI, pinpointing the exact line where the error originated.

## Required Environment Variables

-   `SENTRY_DSN`: **Required** for the SDK to function.
-   `SENTRY_AUTH_TOKEN`: **Required** for source map uploads during build (highly recommended for effective debugging).

## Key Files

- `astro.config.mjs`: Sentry integration setup and source map config.
- `sentry.client.config.js`: Client-side Sentry initialization.
- `sentry.server.config.js`: Server-side Sentry initialization. 