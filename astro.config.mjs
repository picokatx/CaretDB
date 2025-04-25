// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from "@tailwindcss/vite";
import auth from 'auth-astro';
// import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  integrations: [auth()],
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: vercel(),
  output: 'server'
});