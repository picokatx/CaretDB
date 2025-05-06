---
title: Frontend Structure (Layouts & Components)
description: How the frontend UI is structured using Astro layouts and components.
---

The frontend user interface is built using Astro's component architecture.

## Layouts (`src/layouts/`)

- Layout components define the overall HTML structure shared across multiple pages.
- **`Layout.astro`** (or similar) is likely the main layout file.
    - It typically includes the `<html>`, `<head>`, and `<body>` tags.
    - Sets up global styles, fonts, and potentially theme switching logic (e.g., applying `data-theme`).
    - Includes common UI elements like headers, footers, or navigation sidebars.
    - Uses a `<slot />` element to render the specific content of each page that uses the layout.
- Other layouts might exist for specific page types (e.g., a simpler layout for the login page).

## Components (`src/components/`)

- This directory contains reusable UI pieces used within pages or layouts.
- Components can be:
    - Simple presentational components (e.g., a custom button, a card variant).
    - More complex components with client-side interactivity (using `<script>` tags or framework components like React/Vue/Svelte if integrated).
    - Examples might include:
        - A navigation bar component.
        - A component to render statistics.
        - Specific card types for displaying replays or reports.

## Page Content (`src/pages/`)

- `.astro` files in the `src/pages/` directory represent individual pages.
- They typically import a layout component and place their specific content within it.
- They fetch data (in the frontmatter script) needed for the page and pass it to imported components or render it directly in the HTML template section.
    - Example: `dashboard.astro` fetches stats, reports, replays and passes them down or uses them to render tables/cards.

## Styling

- Styling is primarily done using Tailwind CSS utility classes and DaisyUI component classes directly within the `.astro` files' template sections.
- Global styles affecting layouts and base elements are defined in `src/styles/app.css`. 