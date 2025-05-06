---
title: Authentication Setup
description: How user authentication is configured in the project.
---

User authentication is managed using the `Auth.js` library via the `auth-astro` integration.
The core configuration resides in `auth.config.ts` at the root of the project.

## Configuration (`auth.config.ts`)

This file defines:

- **Authentication Providers:** Specifies which OAuth providers (e.g., GitHub, Google) are enabled for login. Credentials (client ID, client secret) for these providers are typically loaded from environment variables (`process.env`).
- **Callbacks:** Defines functions that are executed during the authentication process. This can include:
    - `signIn`: Logic to run when a user attempts to sign in.
    - `redirect`: Custom logic to determine where users are redirected after certain actions.
    - `jwt`: Modifying the JWT payload before it's saved.
    - `session`: Modifying the session object before it's returned to the client (e.g., adding user roles or IDs).
- **Session Strategy:** Usually configured as `jwt` (JSON Web Tokens) for serverless environments.
- **Secret:** A secret key used for signing tokens, loaded from environment variables.

## Session Handling

- The `getSession` function from `auth-astro/server` is used in Astro components (`.astro` files) or API endpoints to retrieve the current user's session.
- If a session exists, it contains user information like name, email, image, and any custom data added via the `session` callback (e.g., user role).
- Pages requiring authentication typically check for a valid session at the beginning and redirect unauthenticated users to a login page.

## Key Files

- `auth.config.ts`: Main configuration for Auth.js.
- `src/pages/login.astro`: (Likely) The page handling the login UI and initiating the sign-in process.
- Components using `getSession`: e.g., `src/pages/dashboard.astro`, potentially layout components. 