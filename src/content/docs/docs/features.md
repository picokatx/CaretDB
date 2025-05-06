---
title: Features
description: Overview of the application's core features.
---

This section describes the main user-facing features of the application.

## Authentication

- Users can log in via configured authentication providers (e.g., GitHub, Google).
- Session management is handled to keep users logged in.
- Access to protected pages like the Dashboard requires authentication.

## Dashboard

- Displays key statistics fetched from the database (User Count, Webstate Count, Replay Count, Event Count).
- Shows a summary of the latest generated monthly report.
- Lists recent replay sessions with links to view them.
- Provides previews of recently captured webstates (DOM snapshots).
- Includes quick action buttons (e.g., Start New Session, View Reports).

## Matrix / Replay Viewer

- Allows users to initiate new recording sessions.
- Provides an interface to view recorded user sessions (replays) based on `replay_id`.
- Can display specific captured webstates based on `html_hash`.

## Reporting

- Generates and displays monthly summary reports.
- Reports typically include statistics like new users, new replays, and total counts over the period.
- Provides a dedicated page to view historical reports. 