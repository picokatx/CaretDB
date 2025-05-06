---
title: insertSerializedNode Query
description: Inserts or updates a node from a DOM snapshot.
---

This query handles the insertion of individual nodes captured during a full DOM snapshot event.

## SQL Query

```sql
INSERT INTO serialized_node (
  id, type, root_id, is_shadow_host, is_shadow,
  compat_mode, name, public_id, system_id,
  tag, is_svg, need_block, is_custom,
  text_content
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
ON DUPLICATE KEY UPDATE type=VALUES(type);
```

## Purpose

To insert a new record representing a single node (element, text, document, etc.) into the `serialized_node` table. If a node with the same `id` already exists, it updates the `type` field (though updating only `type` on duplicate seems potentially limited - perhaps other fields should be updated too, or this implies IDs are reused across snapshots which needs careful handling).

## Parameters

This query expects 14 parameters (`?`) corresponding to the columns in the `VALUES` clause:

1.  `id`: (INT) The unique ID assigned to this node within the snapshot.
2.  `type`: (ENUM) The type of the node (e.g., 'element', 'text', 'document').
3.  `root_id`: (INT, Nullable) The ID of the root node if this node is part of a shadow DOM.
4.  `is_shadow_host`: (BOOLEAN) True if this node hosts a shadow root.
5.  `is_shadow`: (BOOLEAN) True if this node is part of a shadow DOM.
6.  `compat_mode`: (TEXT, Nullable) Document compatibility mode (e.g., 'BackCompat'). Specific to Document nodes.
7.  `name`: (TEXT, Nullable) Name for DocumentType nodes.
8.  `public_id`: (TEXT, Nullable) Public ID for DocumentType nodes.
9.  `system_id`: (TEXT, Nullable) System ID for DocumentType nodes.
10. `tag`: (VARCHAR(24), Nullable) Tag name for Element nodes (e.g., 'div', 'span').
11. `is_svg`: (BOOLEAN) True if this is an SVG element.
12. `need_block`: (BOOLEAN) Indicates if the element requires blocking serialization (rrweb internal).
13. `is_custom`: (BOOLEAN) True if this is a custom element.
14. `text_content`: (TEXT, Nullable) Text content for Text, Comment, or CDATA nodes.

## Usage Context

-   **Save Replay Process:** Called repeatedly within the logic that processes a full snapshot event (likely within the `/api/save-replay` endpoint or related modules). For every node serialized by `rrweb` in the snapshot, this query is executed to save its representation to the database.

## Execution Notes

-   Handles both inserting new nodes and potentially updating existing ones based on `id`.
-   The `ON DUPLICATE KEY UPDATE` clause is specific; ensure its logic aligns with whether node IDs can truly be duplicated across different snapshots or within the same one.
-   Many parameters are nullable or specific to certain node types.
-   Performance is critical as this query runs many times per snapshot. Bulk insertion might be considered if performance becomes an issue. 