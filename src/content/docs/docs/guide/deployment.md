---
title: Deployment
description: How the application is deployed.
---

This project is configured for deployment on [Vercel](https://vercel.com/).

## Configuration

- The `astro.config.mjs` file includes the `@astrojs/vercel/serverless` adapter:
  ```js
  import vercel from '@astrojs/vercel/serverless';
  // ...
  export default defineConfig({
    // ...
    adapter: vercel(),
    output: 'server' // Required for server-side rendering / API routes on Vercel
  });
  ```
- The `output: 'server'` setting enables server-side rendering (SSR) and API routes, which are necessary for features like authentication and the `/api/query_mysql` endpoint.

## Deployment Process

1.  **Connect Repository:** Connect your Git repository (e.g., on GitHub, GitLab, Bitbucket) to a Vercel project.
2.  **Build Settings:** Vercel typically auto-detects Astro projects. Ensure the build command is correct (usually `pnpm build` or `npm run build`) and the output directory is set (usually `dist`).
3.  **Environment Variables:** Configure all necessary environment variables (see the [Environment Variables](./environment-variables) guide) in the Vercel project settings.
4.  **Deploy:** Trigger a deployment manually or configure automatic deployments on Git pushes.

Vercel handles the build process, serverless function deployment, and CDN distribution.

## Key Files

- `astro.config.mjs`: Contains the Vercel adapter configuration.
- `.vercel/`: Directory (often gitignored) containing Vercel-specific build output or configuration locally. 