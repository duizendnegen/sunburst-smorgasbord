# Sunburst Smorgasbord Markdown Format

The data exchange format for the Sunburst Smorgasbord is human-readable markdown. It is converted to and from the internal data format on export and import (instead of the JSON the original app used to exchange).

## Rules

1. There must always be **exactly one `h1` (`#`)**, containing only the name of the board:
   `# Sunburst Smorgasbord`. The exporter appends the language of the document as a suffix, e.g.
   `# Sunburst Smorgasbord - Deutsch` — the importer ignores the `h1` content entirely.
2. The **root node** ("Our relationship includes...") is not part of the document. Importing
   synthesizes it with its fixed identity so the tree stays connected.
3. **Primary nodes** (the first level under the root, e.g. *Kink*, *Creativity*) are `h2` (`##`) —
   one per line. Any depth below that is encoded as an **unordered list**: `- Name (STATE)`,
   indented two spaces per level below the `h2`. A node without children is simply a line with no
   more deeply indented lines below it.
4. Next to each name, in brackets `()`, is the state of that item: `NO`, `MAYBE` or `YES`.
   The exporter writes the stored value; the importer accepts the states **case-insensitively**.
   An unrecognized or missing state defaults to `NO`.
   A node's state never exceeds its parent's (in the app, setting a node to `YES` sets all of
   its ancestors to `YES` as well). On import, each node's state is therefore lifted up to its
   ancestors — e.g. importing `## Kink (MAYBE)` with `- Body contact (YES)` yields `Kink` as `YES`.
5. Item names follow this rule: default-dataset nodes export their translation in the **active UI
   language** (they carry translation keys); user-added and imported items export their stored name
   verbatim. On import, names are always taken verbatim.
6. Free text is **not part of the format** and is ignored on import (this data model has no per-item notes).

## Example

```markdown
# Sunburst Smorgasbord - English

## Kink (YES)
- Body contact (YES)
  - Deep pressure (NO)
- Cuddles (MAYBE)

## Creativity (YES)
- Projects (YES)

## Communication (MAYBE)
```

## Parsing notes

- The `h1` is accepted but its content is ignored; a document without an `h1` still imports.
- A list item that appears before any `h2` attaches to the root (it becomes a primary node).
- Any depth round-trips: each list item attaches to the most recent line at a shallower indentation.
- Blank lines are ignored.
- A document that yields no nodes at all (empty, blank-only, or free text only) is
  invalid: the importer throws, and the UI reports the import error instead of
  replacing the board.
- Importing replaces the current board state entirely (same semantics as the old JSON import).

## In the app

- **Export** (`src/components/ExportMarkdownButton`) downloads the board as
  `sunburst-smorgasbord.md`.
- **Import** (`src/components/ImportMarkdownButton`) replaces the board with a chosen file.
  Files ending in `.json`, or whose content starts with `[` or `{`, are read as a legacy
  JSON export (a plain array of flavours) instead. This fallback is deprecated.
- An imported board is saved to [local storage](local-storage.md) like any other change.
