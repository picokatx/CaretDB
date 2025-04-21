// https://nuxt.com/docs/api/configuration/nuxt-config
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Nora from '@primevue/themes/nora';
import Material from '@primevue/themes/material';
import { definePreset } from '@primevue/themes';
import Particles from "@tsparticles/vue3";
import * as Sentry from "@sentry/nuxt";

const MyPreset = definePreset(Material, {
  semantic: {
    // primary: {
    //   50: '{yellow.50}',
    //   100: '{yellow.100}',
    //   200: '{yellow.200}',
    //   300: '{yellow.300}',
    //   400: '{yellow.400}',
    //   500: '{yellow.500}',
    //   600: '{yellow.600}',
    //   700: '{yellow.700}',
    //   800: '{yellow.800}',
    //   900: '{yellow.900}',
    //   950: '{yellow.950}'
    // },
    // colorScheme: {
    //   dark: {
    //     primary: {
    //         // color: '#84aedf',
    //         // inverseColor: '{yellow.300}',
    //         // hoverColor: '{yellow.300}',
    //         // activeColor: '{yellow.300}',
    //         // background: '{yellow.300}',
    //         hover: {
    //           color: '{red.300}',
    //         }
    //     },
    //     // highlight: {
    //     //     background: '{yellow.300}',
    //     //     focusBackground: '{yellow.300}',
    //     //     color: '{yellow.300}',
    //     //     focusColor: '{yellow.300}'
    //     // }
    // }
    // }
  },
});
export default defineNuxtConfig({
  css: [
    '~/assets/scss/app.css',
    'aos/dist/aos.css'
  ],
  
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/SQLProject/',
    buildAssetsDir: '/_nuxt/',
  },
  
  // Enable route rules for static site generation
  nitro: {
    preset: 'github_pages',
    // Make sure routes are properly generated
    routeRules: {
      '/**': { prerender: true }
    }
  },
  
  plugins: [
    { src: '~/plugins/aos.client.ts', mode: 'client' }
  ],

  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  build: {
    transpile: [
      'ag-grid-vue',
    ]
  },

  modules: [
    '@nuxtjs/eslint-module',
    '@primevue/nuxt-module',
    '@nuxtjs/mdc',
    ['@sentry/nuxt', {
      integrations: {
        replay: true
      },
      sourceMapsUploadOptions: {
        org: 'pkcat',
        project: 'javascript-nuxt'
      },
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    }]
  ],

  primevue: {
    options: {
      ripple: true,
      inputVariant: 'filled',
      // theme: 'none'
      theme: {
        preset: MyPreset,
        options: {
          prefix: 'taiga',
          darkModeSelector: 'system',
          cssLayer: false
        }
      }
    }
  },
  experimental: {
    appManifest: false,
    payloadExtraction: true,
    renderJsonPayloads: true
  },
  sourcemap: {
    client: 'hidden'
  },
})