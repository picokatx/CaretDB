import * as Sentry from "@sentry/astro";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://8fd1ef3a81f6fdc102b53da54d7d2595@o4508760857116672.ingest.de.sentry.io/4509212112060496",

  // Adds request headers and IP for users, for more info visit: for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
  profileLifecycle: 'trace',
});
