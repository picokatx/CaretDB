import PrimeVue from 'primevue/config';
import {
  Button,
  InputText,
  Toast,
  Dialog,
  Select,
  DataTable,
  Column,
  ToastService,
  ProgressSpinner,
  Toolbar,
  Fieldset,
  Divider,
  Panel,
  FloatLabel
  
} from 'primevue';

import Nora from '@primeuix/themes/nora';
import Particles from "@tsparticles/vue3";
import { loadSlim } from "@tsparticles/slim";
export const components = {
  Button,
  InputText,
  Toast,
  Dialog,
  Select,
  DataTable,
  Column,
  ProgressSpinner,
  Toolbar,
  Fieldset,
  Divider,
  Panel,
  FloatLabel
};

export function configurePrimeVue(app: any) {
  app.use(PrimeVue, { 
    ripple: true,
    unstyled: false,
    theme: {
        preset: Nora,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
  });
  app.use(ToastService);
  app.component('Button', Button);
  app.component('InputText', InputText);
  app.component('Toast', Toast);
  app.component('Dialog', Dialog);
  app.component('Select', Select);
  app.component('DataTable', DataTable);
  app.component('Column', Column);
  app.component('ProgressSpinner', ProgressSpinner);
  app.component('Toolbar', Toolbar);
  app.component('Fieldset', Fieldset);
  app.component('Divider', Divider);
  app.component('Panel', Panel);
  app.component('FloatLabel', FloatLabel);
  
} 