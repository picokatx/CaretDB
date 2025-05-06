---
title: GET /dom/preview/:hash.png
description: Serves a preview image for a captured webstate.
---

This endpoint serves a PNG image representing a preview of a specific webstate (DOM snapshot) identified by its hash.

**Method:** `GET`

**URL Parameters:**

- `:hash` (string, required): The unique SHA hash identifying the webstate stored in the database.

**Success Response (200 OK):**

- **Content-Type:** `image/png`
- **Body:** The binary data of the PNG image.

**Error Response (e.g., 404 Not Found, 500 Internal Server Error):**

- Standard HTTP error responses if the hash is not found or an error occurs during image generation/retrieval.

**Notes:**

- This endpoint is typically used in `<img>` tags on the frontend (e.g., on the Dashboard) to display visual previews of captured states.
- The generation of these preview images might happen on-demand or be pre-generated. 