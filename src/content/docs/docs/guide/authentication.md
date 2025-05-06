---
title: Authentication Guide
description: Configuring and managing user authentication using Auth.js (auth-astro).
---

User authentication in CaretDB ensures that only authorized users can access the dashboard, view replays, and perform administrative actions. It is powered by the robust `Auth.js` library, seamlessly integrated into the Astro framework using `auth-astro`.

The primary configuration file for authentication is `auth.config.ts`, located at the root of the project.

## Configuration (`auth.config.ts`)

This crucial file orchestrates the entire authentication flow. Here's a breakdown of its key components:

-   **Providers:** Defines the methods users can use to log in. Typically, this involves OAuth providers like GitHub or Google.
    ```typescript
    import GitHub from "@auth/core/providers/github";
    // ... other imports

    export default {
      providers: [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID,
          clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        // Add other providers like Google, etc.
      ],
      // ... other configurations
    } satisfiesAuthConfig;
    ```
    You **must** provide the corresponding Client ID and Client Secret for each enabled provider via environment variables.

-   **Callbacks:** Allows customization of the authentication lifecycle.
    -   `signIn`: Can prevent sign-in based on custom logic (e.g., checking if the user's email domain is allowed).
    -   `redirect`: Controls where users are sent after sign-in, sign-out, or in case of errors.
    -   `jwt`: Used to encode custom data into the JWT (JSON Web Token) upon successful login. For example, adding a user's database ID or role.
    -   `session`: Used to expose data from the JWT to the client-side session object, making it accessible in your Astro components.
        ```typescript
        callbacks: {
          async session({ session, token }) {
            // Expose user ID from the JWT token to the session object
            if (token.sub && session.user) {
              session.user.id = token.sub; // 'sub' usually holds the user ID
            }
            return session;
          },
          // ... other callbacks like jwt, signIn
        },
        ```

-   **Session Strategy:** Configured as `jwt`. This means user sessions are managed using self-contained JSON Web Tokens, suitable for serverless and edge environments.

-   **Secret (`AUTH_SECRET`):** A critical environment variable containing a random string used to encrypt the JWTs. **Never commit this secret to your repository.** Generate a strong secret (e.g., using `openssl rand -hex 32`).

## Environment Variables

Authentication relies heavily on environment variables. Ensure the following are set in your `.env` file or deployment environment:

-   `AUTH_SECRET`: A strong secret for JWT encryption.
-   `AUTH_TRUST_HOST=true`: Required for non-HTTPS local development or specific deployment scenarios. Set to `false` in production if behind a trusted proxy handling TLS.
-   `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`: Credentials for the GitHub provider (if enabled).
-   `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: Credentials for the Google provider (if enabled).
-   *(Add variables for any other configured providers)*

## Protecting Pages and Routes

To restrict access to specific pages or API routes, you need to check for a valid user session.

**In Astro Pages (`.astro`):**

```astro
---
import { getSession } from "auth-astro/server";

const session = await getSession(Astro.request);

// If no session exists or the user is not authorized, redirect to login
if (!session?.user) {
  return Astro.redirect("/login?error=Unauthorized"); // Redirect to your login page
}

// Proceed with rendering the protected page content
---
<h1>Welcome, {session.user.name}!</h1>
<!-- Protected content -->
```

**In API Endpoints (`src/pages/api/...`):**

```typescript
// src/pages/api/protected-data.ts
import type { APIRoute } from "astro";
import { getSession } from "auth-astro/server";

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch and return protected data, potentially using session.user.id
  const userId = session.user.id;
  // ... database query using userId ...

  return new Response(JSON.stringify({ data: "some protected data" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

## Accessing Session Data

As shown above, `getSession(Astro.request)` (or `getSession(request)` in API routes) returns the session object. If the user is logged in, `session.user` will contain details like `name`, `email`, `image`, and any custom fields you added via the `session` callback (like `id`).

## Key Files & Components

-   `auth.config.ts`: The central configuration hub.
-   `src/env.d.ts`: Often includes type definitions for environment variables used by Auth.js.
-   `src/middleware.ts`: (Optional) Astro middleware can be used to protect multiple routes centrally.
-   `src/pages/login.astro`: (Likely) A page displaying login buttons for configured providers.
-   `src/components/AuthButtons.astro`: (Likely) A component rendering Sign In/Sign Out buttons based on session state. 