---
title: Core Features
description: Discover the key capabilities of the CaretDB platform.
---

CaretDB offers a range of features designed to help you capture, replay, and analyze user web sessions effectively. Here's an overview of the core functionalities:

## Session Recording

*   **What it is:** CaretDB integrates with the `rrweb` library to capture a detailed stream of events representing user interactions and browser changes during a session.
*   **How it works:** A small script included on your target web pages records DOM mutations, mouse movements, clicks, input changes, scrolls, console logs, network requests, and more. This data is sent to the CaretDB backend for storage.
*   **Why it's useful:** Provides the raw data needed for pixel-perfect session replays and in-depth analysis.

## Session Replay

*   **What it is:** The ability to watch a recorded user session exactly as it occurred in the user's browser.
*   **How it works:** The Matrix/Replay Viewer uses the stored event stream (`rrweb` events) and the initial DOM snapshot (`webstate`) to reconstruct the user's experience in an iframe.
*   **Why it's useful:** Essential for debugging user-reported issues, understanding user journeys, identifying bugs, and performing usability analysis.

## Dashboard Overview

*   **What it is:** A central hub providing a quick glance at key metrics and recent activity.
*   **How it works:** Fetches aggregated data from the database, such as total user, webstate, and replay counts, and displays summaries of recent replays and captured page states.
*   **Why it's useful:** Offers a high-level perspective on platform usage and allows quick access to recent recordings.

## Authentication & Authorization

*   **What it is:** Secure user login and access control.
*   **How it works:** Leverages `auth-astro` to integrate with external OAuth providers (like GitHub, Google). Ensures only authenticated users can access sensitive data and features like the dashboard and replays.
*   **Why it's useful:** Protects recorded data and administrative functions from unauthorized access.

## DOM Snapshot Management (`webstate`)

*   **What it is:** Efficient storage of unique initial page structures.
*   **How it works:** When a recording starts, the initial HTML DOM is captured. A hash of this structure is stored in the `webstate` table. Subsequent recordings starting on the *exact same* page state reuse the existing `webstate` entry, saving storage space.
*   **Why it's useful:** Reduces data redundancy and provides a stable starting point for replays.

## Data Storage (MySQL Database)

*   **What it is:** A robust relational database schema for storing all captured session data.
*   **How it works:** Utilizes MySQL to store user information, webstates, replay metadata, individual events, console logs, network requests, and more in a structured format. See the [Database](./database/) section for full details.
*   **Why it's useful:** Ensures data integrity, allows for complex querying and analysis, and provides a scalable storage solution.

## Reporting (Basic)

*   **What it is:** Automated generation and display of monthly summary reports.
*   **How it works:** A scheduled event (`monthly_report_scheduler`) triggers a stored procedure (`generate_monthly_report`) to aggregate key metrics (e.g., total replays, new users) for the previous month into the `monthly_reports` table.
*   **Why it's useful:** Provides periodic insights into platform usage trends. *Note: This is a basic implementation and can be expanded.* 