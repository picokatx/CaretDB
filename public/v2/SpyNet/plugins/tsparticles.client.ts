import Particles from "@tsparticles/vue3";
import { loadSlim } from '@tsparticles/slim'; // Slim version of tsParticles

export default defineNuxtPlugin(async (nuxtApp) => {
    nuxtApp.vueApp.use(Particles, {
        init: async (engine) => {
            await loadSlim(engine); // Initialize the tsParticles engine
        },
    });
});