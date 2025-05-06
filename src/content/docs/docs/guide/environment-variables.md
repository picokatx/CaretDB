---
title: Environment Variables
description: Required environment variables for the application.
---

The application requires several environment variables to be set for proper functionality, especially for authentication, database connections, and third-party services.

It's recommended to use a `.env` file for local development (ensure `.env` is listed in your `.gitignore`). For deployment (e.g., on Vercel), these variables must be configured in the platform's environment variable settings.

## Required Variables

- **`AUTH_SECRET`**: 
    - **Purpose:** A secret string used by Auth.js (auth-astro) to sign and encrypt JWTs, cookies, and other tokens.
    - **Generation:** Can be generated using `openssl rand -hex 32` or similar methods.
    - **Used in:** `auth.config.ts`.

- **`AUTH_TRUST_HOST`**: 
    - **Purpose:** Should be set to `true` when deploying to ensure Auth.js trusts the host header.
    - **Used in:** Auth.js internal handling, especially in production environments.

- **Database Connection Variables:**
    - **Purpose:** Credentials needed to connect to the MySQL database.
    - **Examples (adjust names as needed based on your DB client setup):**
        - `DB_HOST`: Database server hostname.
        - `DB_USER`: Database username.
        - `DB_PASSWORD`: Database password.
        - `DB_NAME`: Database name.
        - `DB_PORT`: Database port (e.g., 3306).
    - **Used in:** Database client connection logic (likely within API routes like `/api/query_mysql` or a dedicated DB connection module).

- **OAuth Provider Credentials:** (Required if using OAuth providers)
    - **Purpose:** Client ID and Client Secret for each enabled OAuth provider.
    - **Examples:**
        - `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
        - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
    - **Used in:** `auth.config.ts` within the provider configurations.

- **`SENTRY_DSN`**: 
    - **Purpose:** The Data Source Name (DSN) for connecting to Sentry for error tracking.
    - **Used in:** `sentry.client.config.js`, `sentry.server.config.js`, and `astro.config.mjs` (Sentry integration).

- **`SENTRY_AUTH_TOKEN`**: 
    - **Purpose:** An authentication token for uploading source maps to Sentry during the build process.
    - **Used in:** `astro.config.mjs` (Sentry integration source maps upload).

## Accessing Variables

- In Astro components and API routes, backend environment variables are typically accessed via `import.meta.env.VARIABLE_NAME`.
- Ensure you configure Astro for environment variable exposure if needed on the client-side (using `PUBLIC_` prefix), though most of these are backend-only. 