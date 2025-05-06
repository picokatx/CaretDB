---
title: Frontend Structure Guide
description: Understanding Astro layouts, components, and page structure in CaretDB.
---

CaretDB's frontend is built using Astro, a modern web framework that leverages server-side rendering by default and allows for islands of client-side interactivity where needed. The structure revolves around layouts, reusable components, and individual pages.

## Layouts (`src/layouts/`)

Layouts are special Astro components designed to provide a common structure for multiple pages. Think of them as page templates.

-   **Purpose:** Define the outer HTML shell (`<html>`, `<head>`, `<body>`), include global stylesheets and scripts, and render common UI elements like headers, footers, or navigation.
-   **Main Layout (`Layout.astro`):** This is typically the primary layout used for most application pages.
    -   It sets up the main HTML document structure.
    -   Imports global CSS (`app.css`).
    -   Often includes the main header/navigation component.
    -   Applies the global `data-theme` for DaisyUI theming.
    -   Crucially, it uses the `<slot />` tag. The `<slot />` acts as a placeholder where the specific content from each individual page (`.astro` file in `src/pages/`) will be injected.
-   **Other Layouts:** You might find other layouts for specific purposes, such as `LoginLayout.astro` for pages outside the main authenticated application structure, or potentially layouts specific to the documentation section (though Starlight handles its own layout).

**Example (`Layout.astro` simplified):**

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/app.css'; // Import global styles

interface Props {
  title: string;
}
const { title } = Astro.props;
---
<html lang="en" data-theme="dark"> { /* Apply theme */ }
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>{title} - CaretDB</title>
  {/* Other head elements */}
</head>
<body>
  <Header /> { /* Common header */ }
  <main class="container mx-auto p-4">
    <slot /> { /* Page-specific content goes here */ }
  </main>
  <Footer /> { /* Common footer */ }
</body>
</html>
```

## Components (`src/components/`)

This directory houses reusable pieces of UI used across different pages or even within other components.

-   **Purpose:** Promote code reuse, maintainability, and separation of concerns.
-   **Types:**
    -   **UI Primitives:** Simple, often stateless components like custom buttons, badges, or styled containers (`Card.astro`, `StatDisplay.astro`).
    -   **Complex Components:** Components responsible for rendering specific data structures or handling interactions (`ReplayList.astro`, `ReportTable.astro`, `Header.astro`).
    -   **Interactive Components:** Components requiring client-side JavaScript for interactivity (e.g., a dropdown menu, a theme switcher). These might use Astro's `client:*` directives or be built with UI frameworks like Preact/React/Svelte if integrated.
-   **Data Flow:** Components typically receive data as props from the parent page or component that uses them.

**Example (`StatDisplay.astro`):**

```astro
---
interface Props {
  title: string;
  value: string | number;
  description?: string;
}
const { title, value, description } = Astro.props;
---
<div class="stat place-items-center">
  <div class="stat-title">{title}</div>
  <div class="stat-value">{value}</div>
  {description && <div class="stat-desc">{description}</div>}
</div>
```

## Pages (`src/pages/`)

Files within `src/pages/` define the actual, navigable routes of your application.

-   **Purpose:** Each `.astro` file corresponds to a specific URL path. They orchestrate the display of content for that route.
-   **Structure:**
    -   **Frontmatter (`---` block):** Contains server-side JavaScript that runs when a request hits the page. This is where you:
        -   Import layouts and components.
        -   Fetch data required for the page (e.g., from the database via API calls or directly if using server-side logic).
        -   Define props to pass down to layouts and components.
    -   **Template (HTML block):** Defines the HTML structure unique to the page.
        -   Wraps content within an imported layout component (`<Layout title="Dashboard">...`)
        -   Uses imported components, passing fetched data as props (`<ReplayList replays={recentReplays} />`).
        -   Includes page-specific HTML and text.

**Example (`dashboard.astro` simplified):**

```astro
---
import Layout from '../layouts/Layout.astro';
import StatDisplay from '../components/StatDisplay.astro';
import ReplayList from '../components/ReplayList.astro';
import { getSession } from 'auth-astro/server';

// --- Authentication Check ---
const session = await getSession(Astro.request);
if (!session?.user) return Astro.redirect('/login');

// --- Data Fetching ---
// Replace with actual API calls to your backend
const stats = { users: 150, replays: 1200, webstates: 300 }; 
const recentReplays = [{ id: 'abc', startTime: '...' }, { id: 'def', startTime: '...' }];
---
<Layout title="Dashboard">
  <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
  
  <div class="stats shadow mb-6">
    <StatDisplay title="Total Users" value={stats.users} />
    <StatDisplay title="Total Replays" value={stats.replays} />
    <StatDisplay title="Web States" value={stats.webstates} />
  </div>

  <h2 class="text-2xl font-bold mb-4">Recent Replays</h2>
  <ReplayList replays={recentReplays} />

</Layout>
```

## Styling Application

-   As covered in the [Styling Guide](./styling/), styles are applied using Tailwind and DaisyUI classes directly within the component and page templates.
-   Global styles reside in `src/styles/app.css`. 