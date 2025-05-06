---
title: Styling & Theming Guide
description: Understanding how Tailwind CSS, DaisyUI, and Starlight theming work together.
---

CaretDB achieves its look and feel through a combination of Tailwind CSS for utility classes, DaisyUI for pre-built components and theming, and some custom CSS to tie everything together, including the Starlight documentation theme.

## Core Technologies

1.  **Tailwind CSS:** Provides low-level utility classes (`p-4`, `flex`, `text-red-500`, etc.) for building custom designs directly in the HTML. It's configured in `tailwind.config.mjs` and integrated via the `@tailwindcss/vite` plugin in `astro.config.mjs`.

2.  **DaisyUI:** A component library built on top of Tailwind. It offers pre-styled components like buttons (`btn`), cards (`card`), alerts (`alert`), etc., reducing the need to write common styles from scratch. Crucially, DaisyUI provides a powerful theming system.

3.  **Starlight:** The documentation framework used for `/docs`. It has its own theming system based on CSS variables.

## Configuration & Integration

-   **Tailwind & Astro:** The `@tailwindcss/vite` plugin is added in `astro.config.mjs` to process Tailwind classes.
-   **DaisyUI Integration:** DaisyUI is enabled as a *plugin within your CSS*, specifically in `src/styles/app.css`:
    ```css
    /* src/styles/app.css */
    @import "tailwindcss/base";
    @import "tailwindcss/components";
    @import "tailwindcss/utilities";
    @import "@astrojs/starlight/style/base.css"; /* Starlight base */

    @plugin "daisyui" {
      /* Enable all themes, or list specific ones */
      themes: all;
    }

    /* ... rest of the file ... */
    ```
-   **Custom CSS (`app.css`):** This file (`src/styles/app.css`) is central:
    -   It imports the necessary Tailwind layers and Starlight base styles.
    -   It configures and activates the DaisyUI plugin.
    -   It contains custom global styles and overrides.
    -   **Crucially, it synchronizes the selected DaisyUI theme with Starlight's theme.**

## Theming with DaisyUI

DaisyUI makes theming straightforward:

1.  **Enabling Themes:** The `@plugin "daisyui" { themes: all; }` line in `app.css` makes all DaisyUI built-in themes available (like `light`, `dark`, `cupcake`, `dracula`, etc.).
2.  **Applying a Theme:** A theme is applied by adding the `data-theme` attribute to an HTML element, usually the root `<html>` tag. This is typically done in your main layout file (e.g., `src/layouts/Layout.astro`):
    ```astro
    <html lang="en" data-theme="dark">
      {/* The rest of your layout */}
    </html>
    ```
    All DaisyUI components within that element will automatically adapt to the specified theme (`dark` in this case).

## Synchronizing with Starlight Theme

Since the documentation (`/docs/*`) uses Starlight, its components need to match the theme applied to the rest of the application. This synchronization happens in `src/styles/app.css`:

```css
/* src/styles/app.css */

/* ... imports and daisyui plugin ... */

:root {
  /* Map DaisyUI variables to Starlight variables */
  /* Example for background color: */
  --sl-color-bg: var(--b1); /* --b1 is DaisyUI's base background */

  /* Example for primary accent: */
  --sl-color-accent-low: var(--p); /* --p is DaisyUI's primary color */
  --sl-color-accent: var(--p); 
  --sl-color-accent-high: var(--pf); /* --pf is DaisyUI's primary focus/hover */

  /* ... map other necessary Starlight variables ... */
}
```

-   The `:root` selector targets the base HTML element.
-   Inside `:root`, we define Starlight's CSS variables (like `--sl-color-bg`, `--sl-color-accent`).
-   We set the value of each Starlight variable to the corresponding DaisyUI variable (like `var(--b1)`, `var(--p)`).
-   Because DaisyUI changes the values of *its* variables based on the active `data-theme`, Starlight's variables automatically update whenever the `data-theme` changes, keeping the documentation visually consistent with the main application theme.

## Applying Styles

-   **Components:** Use DaisyUI classes (`btn`, `card`, `input`, etc.) and Tailwind utility classes (`p-4`, `flex`, `items-center`, etc.) directly on elements within your `.astro` components.
    ```astro
    <div class="card bg-base-200 shadow-xl p-6">
      <h2 class="card-title text-primary mb-4">User Settings</h2>
      <button class="btn btn-secondary mt-2">Save Changes</button>
    </div>
    ```
-   **Global Styles:** For styles that need to apply everywhere or require complex selectors not easily handled by utilities, add them to `src/styles/app.css`.

## Key Files Review

-   `tailwind.config.mjs`: Configures Tailwind (content paths, theme extensions if any).
-   `src/styles/app.css`: Central hub for imports, DaisyUI config, global styles, and Starlight theme sync.
-   `astro.config.mjs`: Integrates Tailwind and tells Starlight to use `app.css`.
-   `src/layouts/Layout.astro` (or similar): Likely applies the global `data-theme` attribute. 