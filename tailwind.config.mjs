import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    // try a couple themes out https://daisyui.com/docs/themes/
    //themes: ["synthwave"]
  },
};