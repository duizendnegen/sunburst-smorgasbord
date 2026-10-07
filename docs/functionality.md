# Sunburst Smorgasbord Functionality

The Sunburst Smorgasbord is a sunburst chart of relationship "flavours". The root
("Our relationship includes...") sits in the center; each ring outward is one level
deeper in the tree. Primary flavours (the first ring, e.g. *Collaboration*, *Labels*)
each get their own colour, which all their descendants share.

## Data model

The board is a flat list of flavours (`src/interfaces.tsx`), each pointing to its parent:

| Field        | Meaning                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| `uuid`       | Unique identity of the flavour.                                             |
| `parentUuid` | `uuid` of the parent; empty for the root.                                   |
| `key`        | Translation key (`flavours.<key>`) for default flavours. Absent for user-added ones. |
| `name`       | Display name, used when there is no `key`.                                  |
| `state`      | `NO`, `MAYBE` or `YES`. A missing state is treated as `NO`.                 |

The list lives in the `flavours` Recoil atom (`src/states/flavours.atom.tsx`). Two
selectors derive the tree from it: `hierarchicalFlavours` (a d3 hierarchy, used for
editing) and `hierarchicalNodes` (the partitioned, coloured nodes the chart draws).
Every leaf gets the same angular size, so a branch's slice is proportional to its
number of leaves.

## Selecting flavours

Clicking a flavour cycles its state: **NO → YES → MAYBE → NO**. The colour shows the
state: full colour for `YES`, a darker shade for `MAYBE`, black for `NO`. The root
cannot be clicked.

A flavour's state never exceeds its parent's, so a click propagates through the tree
(`cycleFlavourState` in `src/helpers.tsx`):

- **YES**: all ancestors become `YES` as well.
- **MAYBE**: descendants that were `YES` become `MAYBE`; other descendants and all
  ancestors are left alone.
- **NO**: all descendants become `NO` as well.

## Rotating the board

Pressing on the board and dragging rotates it around its center, so labels can be read
from any angle. A press-and-release counts as a click as long as the pointer moved no
more than 10px (`DRAG_THRESHOLD_PX` in `src/components/Smorgasbord/Smorgasbord.tsx`);
movement within that threshold does not rotate the board. Rotation follows mouse moves
only — on touch screens a drag scrolls the page instead.

## Editing the board

**Edit** opens a modal to customize the board:

- **Add** a flavour as a child of any existing flavour. The new flavour starts as `YES`,
  and so do all of its ancestors.
- **Remove** a flavour together with all of its descendants. The root cannot be removed.

User-added flavours have no translation key; their name is shown as typed in every
language.

## Persistence, reset and languages

- The board is saved to the browser's `localStorage` on every change and restored on
  the next visit. Without a saved board, the default board is loaded from
  `public/flavours.json` with every flavour set to `NO`.
- **Reset** (after confirmation) replaces the board with the default board.
- The footer switches the UI language. Default flavours are shown in the active
  language; translations live in `public/locales/<language>/translation.json`.

## Import and export

- **Export** downloads the board as markdown; **Import** replaces the board with an
  exported markdown file (legacy JSON exports are still accepted). The format is
  described in [markdown-format.md](markdown-format.md).
- **Download as image** downloads the board as a PNG. Flavours set to `NO` are hidden in
  the image, so it shows only what the relationship includes.
