// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from "@tailwindcss/vite";
import auth from 'auth-astro';
import sentry from '@sentry/astro';
// import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  integrations: [auth(),
    sentry({
      dsn: "https://8fd1ef3a81f6fdc102b53da54d7d2595@o4508760857116672.ingest.de.sentry.io/4509212112060496",
      // Setting this option to true will send default PII data to Sentry.
      // For example, automatic IP address collection on events
      // sendDefaultPii: true,
      sourceMapsUploadOptions: {
        project: "caretdb",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: vercel(),
  output: 'server'
});