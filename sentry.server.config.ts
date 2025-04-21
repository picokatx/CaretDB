import * as Sentry from "@sentry/nuxt";
 
Sentry.init({
  dsn: "https://7945f8a4738370a0f9a9e5ef2c1f0801@o4508760857116672.ingest.de.sentry.io/4508760863277136",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
