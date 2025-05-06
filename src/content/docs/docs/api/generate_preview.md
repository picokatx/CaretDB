---
title: POST /api/generate_preview
description: Generates a PNG preview image for a given webstate hash.
---

This endpoint uses Playwright (headless Chromium) to visit the HTML page corresponding to a webstate hash and take a screenshot, saving it as a PNG file in the `/public/dom/preview/` directory.

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "html_hash": "<64_character_sha256_hash>"
}
```

- `html_hash` (string, required): The SHA-256 hash identifying the webstate for which to generate a preview.

**Success Response (200 OK):**

Indicates that the preview was generated successfully or already existed.

```json
{
  "success": true,
  "message": "Preview generated successfully." 
}
```

*Or*

```json
{
  "success": true,
  "message": "Preview already exists." 
}
```

**Error Response:**

- **400 Bad Request:** If the `html_hash` parameter is missing, invalid, or the request body is not valid JSON.
  ```json
  {
    "success": false,
    "error": "Invalid or missing html_hash parameter."
  }
  ```
- **500 Internal Server Error:** If an error occurs during the Playwright screenshot generation process.
  ```json
  {
    "success": false,
    "error": "Failed to generate preview: <Playwright error message>"
  }
  ```

**Notes:**

- This endpoint requires Playwright and its browser dependencies (`@playwright/test`) to be installed.
- It assumes the webstate HTML content is accessible via a route like `/dom/<html_hash>.html`.
- The endpoint first checks if a preview image (`/public/dom/preview/<html_hash>.png`) already exists before attempting generation.
- File system permissions are needed to create the `/public/dom/preview` directory and write files into it.
- Generating previews can be resource-intensive (CPU/memory for headless browser). 