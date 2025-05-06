---
title: Styling & Theming
description: How the project utilizes Tailwind CSS and DaisyUI for styling.
---

The project uses a combination of Tailwind CSS and the DaisyUI component library, configured via Astro integrations and custom CSS.

## Tailwind CSS

- **Core Utility Classes:** Tailwind provides the foundational utility classes for styling (e.g., `text-2xl`, `font-bold`, `mb-4`, `flex`, `grid`).
- **Configuration:** Basic Tailwind configuration is in `tailwind.config.mjs`.
- **Integration:** Integrated via `@tailwindcss/vite` plugin in `astro.config.mjs` and imported in `app.css`.

## DaisyUI

- **Component Library:** Built on top of Tailwind, DaisyUI provides pre-styled components (e.g., `btn`, `card`, `alert`, `stats`, `badge`).
- **Configuration:** Enabled via the `@plugin "daisyui"` directive within `src/styles/app.css`.
    - `themes: all;` enables all built-in DaisyUI themes.
- **Usage:** Components are styled by adding DaisyUI class names (e.g., `<button class="btn btn-primary">`).
- **Theming:** Themes can be applied globally (often in `Layout.astro` or root HTML) using the `data-theme` attribute (e.g., `<html data-theme="dark">`).

## Custom Styles (`src/styles/app.css`)

This file serves several purposes:

1.  **Imports:** Imports Tailwind base, components, utilities, and Starlight styles (`@import`).
2.  **DaisyUI Plugin:** Configures and enables the DaisyUI plugin (`@plugin "daisyui"`).
3.  **Global Overrides/Variables:** Defines custom CSS variables or overrides styles globally.
    - It includes `:root` definitions that reference DaisyUI variables (like `var(--b1)`) to create custom theme variables (like `--bg`) and map them to Starlight variables (`--sl-color-*`). This ensures Starlight documentation components match the selected DaisyUI theme.

## Key Files

- `tailwind.config.mjs`: Tailwind configuration.
- `src/styles/app.css`: Imports, DaisyUI config, custom global styles, Starlight theme mapping.
- `astro.config.mjs`: Integrates Tailwind via Vite plugin and links `app.css` to Starlight.
- UI Components (`.astro` files in `src/components`, `src/pages`): Apply Tailwind and DaisyUI classes. 