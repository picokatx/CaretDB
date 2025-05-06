---
title: Environment Variables Guide
description: Configuration of required and optional environment variables for CaretDB.
---

CaretDB relies on environment variables for critical configuration, including database connections, authentication secrets, and integrations with third-party services. Proper configuration is essential for both local development and production deployment.

## Management

-   **Local Development:** Use a `.env` file at the project root. Create this file if it doesn't exist and add your variables there. **Crucially, ensure `.env` is listed in your `.gitignore` file to prevent accidentally committing secrets.**
-   **Deployment (Vercel):** Configure these variables directly in your Vercel project's settings under "Settings" > "Environment Variables". Mark sensitive values (like secrets and passwords) as "Secret".

## Variable Groups

Variables can be grouped by their purpose:

### 1. Authentication (Auth.js)

These are required for the `auth-astro` integration to function.

-   `AUTH_SECRET`
    -   **Required:** Yes
    -   **Purpose:** A high-entropy secret string used by Auth.js to sign/encrypt JWTs, session cookies, etc.
    -   **Security:** **HIGHLY SENSITIVE.** Keep this secret. Do not commit it.
    -   **Generation:** Use `openssl rand -base64 32` or `openssl rand -hex 32` in your terminal.
    -   **Example:** `AUTH_SECRET="your_generated_super_secret_string"`

-   `AUTH_TRUST_HOST`
    -   **Required:** Yes (usually)
    -   **Purpose:** Tells Auth.js whether to trust the `Host` header from the request. Essential for correct redirect URLs after login, especially behind proxies.
    -   **Value:** Set to `"true"` for most deployments (like Vercel) and local development. Set to `"false"` only in specific secure environments where you are certain the host header cannot be manipulated.
    -   **Example:** `AUTH_TRUST_HOST="true"`

-   `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET`
    -   **Required:** Only if using the GitHub login provider.
    -   **Purpose:** Credentials obtained from your GitHub OAuth App configuration.
    -   **Security:** Secret is sensitive.
    -   **Example:**
        ```
        AUTH_GITHUB_ID="your_github_client_id"
        AUTH_GITHUB_SECRET="your_github_client_secret"
        ```

-   `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`
    -   **Required:** Only if using the Google login provider.
    -   **Purpose:** Credentials obtained from your Google Cloud Platform OAuth 2.0 Client ID configuration.
    -   **Security:** Secret is sensitive.
    -   **Example:**
        ```
        AUTH_GOOGLE_ID="your_google_client_id"
        AUTH_GOOGLE_SECRET="your_google_client_secret"
        ```
    *(Add variables for any other OAuth providers you configure in `auth.config.ts`)*

### 2. Database (MySQL)

Required for connecting to your MySQL database.

-   `DATABASE_URL`
    -   **Required:** Yes
    -   **Purpose:** The connection string for your MySQL database.
    -   **Security:** **HIGHLY SENSITIVE.** Contains host, user, password, and database name.
    -   **Format:** `mysql://[user]:[password]@[host]:[port]/[database_name]`
    -   **Example:** `DATABASE_URL="mysql://admin:secretpw@db.example.com:3306/caretdb"`
    -   *(Note: Some database clients/ORMs might use separate variables like `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. This project appears configured to use a single `DATABASE_URL` based on common practices with tools like Prisma or Drizzle ORM, but verify based on the actual DB connection code if issues arise).* 

### 3. Sentry (Error Tracking - Optional)

These are only required if you want to integrate with Sentry for error monitoring.

-   `SENTRY_DSN`
    -   **Required:** Only if using Sentry.
    -   **Purpose:** The unique identifier for your Sentry project, telling the SDK where to send events.
    -   **Security:** Moderately sensitive (publicly available DSNs can receive events, but not access account data).
    -   **Example:** `SENTRY_DSN="https://your_key@oXXXXXX.ingest.sentry.io/XXXXXXX"`

-   `SENTRY_AUTH_TOKEN`
    -   **Required:** Only if using Sentry **and** want automated source map uploads during the Vercel build.
    -   **Purpose:** An authentication token allowing the build process to upload JavaScript source maps to Sentry for better stack traces.
    -   **Security:** Sensitive. Treat like an API key.
    -   **Example:** `SENTRY_AUTH_TOKEN="your_sentry_auth_token"`

## Accessing Variables in Code

-   **Backend (API Routes, Server-Side Logic in `.astro`):** Environment variables are accessed via `process.env.VARIABLE_NAME` in Node.js environments like Vercel serverless functions or Astro's server-side rendering context.
    ```typescript
    // Example in an API route
    const dbUrl = process.env.DATABASE_URL;
    const githubId = process.env.AUTH_GITHUB_ID;
    ```
-   **Client-Side (Browser):** By default, environment variables are **not** exposed to the client-side browser for security reasons. If you explicitly need a variable in the browser (e.g., an analytics key), you **must** prefix it with `PUBLIC_` in your `.env` file and access it via `import.meta.env.PUBLIC_VARIABLE_NAME`. None of the variables listed above typically need client-side exposure.

Always restart your development server after changing `.env` variables for the changes to take effect. 