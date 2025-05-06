---
title: API Reference
description: Details about the available API endpoints.
---

This section documents the backend API routes available in the application.

## Base URL

All API routes are relative to the application's base URL.

## Authentication

API routes defined within Astro might or might not be protected by authentication depending on their implementation. 

- Routes requiring authentication (like potentially `/api/query_mysql` if it handles user-specific data) should use `getSession` from `auth-astro/server` at the beginning to check for a valid user session and return an unauthorized error (e.g., 401) if none is found.
- Public routes (like `/dom/preview/:hash.png`) do not need this check.

## Conventions

- **JSON:** API routes typically expect and return JSON payloads.
- **Error Handling:** Errors should be returned with appropriate HTTP status codes (e.g., 400 for bad requests, 404 for not found, 500 for server errors) and a JSON body containing a `success: false` flag and an `error` object with a descriptive message.

## Endpoints

- **[`/api/query_mysql`](./query_mysql)**: Executes predefined SQL queries against the database.
- **[`/dom/preview/:hash.png`](./dom_preview)**: Serves preview images for captured webstates.

*(More endpoints might exist, review `src/pages/api` and `src/pages/dom` for a complete list)* 