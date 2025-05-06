---
title: POST /api/upload-html
description: Uploads an HTML file, saves it, injects scripts, and registers its hash.
---

This endpoint handles the upload of an HTML file representing a web page state. It performs several actions:

1.  Calculates the SHA-256 hash of the HTML content.
2.  Injects the rrweb CDN script into the `<head>`.
3.  Injects a loader script (`/dom/rrweb_loader.js`) before the closing `</body>` or `</html>` tag.
4.  Saves the modified HTML content to `/public/dom/<hash>.html`.
5.  Inserts the calculated `html_hash` (and associated user email) into the `webstate` database table.

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Request Body:**

- Expects form data containing a file input field named `html`.
- The uploaded file must have a `.html` extension.

**Success Response (200 OK):**

Indicates the file was processed, saved, and the hash registered.

```json
{
  "success": true, 
  "fileName": "<hash>.html",
  "url": "/dom/<hash>.html"
}
```

**Error Response:**

- **400 Bad Request:** If no file is uploaded, the file is not HTML, or form data is invalid.
  ```json
  {
    "success": false,
    "error": "Invalid file. Must be HTML."
  }
  ```
- **500 Internal Server Error:** If there's an error during file processing, script injection, file saving, or database interaction.
  ```json
  {
    "success": false,
    "error": "Failed to process upload" 
  }
  ```
  *Or specific database errors:* 
  ```json
  {
    "success": false,
    "error": "Failed to update database: <DB error message>" 
  }
  ```

**Notes:**

- **User Association:** This endpoint currently uses placeholder user emails (`user@example.com`) when inserting into the `webstate` table. It needs to be updated to retrieve the actual logged-in user's email from the session and use that for the database insertion.
- **Script Injection:** The endpoint modifies the uploaded HTML to include necessary scripts for rrweb functionality. It attempts to place them correctly within `<head>` and before `</body>` but has fallbacks if those tags aren't found.
- **File System Access:** Requires write permissions for the `/public/dom/` directory.
- **Database Access:** Uses the `insertWebstateHash` query from `sql_query_locale.ts`. 