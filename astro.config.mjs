// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from "@tailwindcss/vite";
import auth from 'auth-astro';
import sentry from '@sentry/astro';
import starlight from '@astrojs/starlight';
// import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  integrations: [auth(), sentry({
    dsn: "https://8fd1ef3a81f6fdc102b53da54d7d2595@o4508760857116672.ingest.de.sentry.io/4509212112060496",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    // sendDefaultPii: true,
    sourceMapsUploadOptions: {
      project: "caretdb",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    },
  }), starlight({
    title: 'My delightful docs site',
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
    sidebar: [
      {
        label: 'Overview',
        items: [
          { label: 'Welcome', link: '/docs/' },
          { label: 'Features', link: '/docs/features/' },
        ]
      },
      {
        label: 'Guide',
        items: [
          { label: 'Authentication', link: '/docs/guide/authentication/' },
          { label: 'Styling & Theming', link: '/docs/guide/styling/' },
          { label: 'Frontend Structure', link: '/docs/guide/frontend-structure/' },
          { label: 'Deployment', link: '/docs/guide/deployment/' },
          { label: 'Environment Variables', link: '/docs/guide/environment-variables/' },
          { label: 'Error Handling', link: '/docs/guide/error-handling/' },
          { label: 'Testing', link: '/docs/guide/testing/' },
          { label: 'Dependencies', link: '/docs/guide/dependencies/' },
          { label: 'Project Structure', link: '/docs/guide/project-structure/' },
        ]
      },
      {
        label: 'API Reference',
        autogenerate: { directory: 'docs/api' }
        // items: [ // Manual alternative to autogenerate
        //   { label: 'Overview', link: '/docs/api/' },
        //   { label: '/api/query_mysql', link: '/docs/api/query_mysql/' },
        //   { label: '/dom/preview', link: '/docs/api/dom_preview/' },
        // ]
      },
      {
        label: 'Database',
        items: [
          { label: 'Schema', link: '/docs/database/schema/' },
          { label: 'SQL Queries Overview', link: '/docs/database/queries/' },
          { label: 'Query Definitions File', link: '/docs/database/query-definitions/' },
        ]
      },
    ],
    customCss: [
      // Relative path to your custom CSS file
      './src/styles/app.css',
    ],
  })],
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: vercel(),
  output: 'server'
});