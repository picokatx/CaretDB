// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import vercel from '@astrojs/vercel';
import tailwindcss from "@tailwindcss/vite";
import auth from 'auth-astro';
// import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  integrations: [vue({
    appEntrypoint: '/src/lib/vue-app',
    jsx: true
  }), auth()],
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: vercel(),
  output: 'server'
});