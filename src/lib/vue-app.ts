import type { App } from 'vue';
import { configurePrimeVue } from './primevue';

export default (app: App) => {
  configurePrimeVue(app);
}; 