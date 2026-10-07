# Local Storage

The app has no backend: the board only ever lives in the visitor's browser. It is kept
in `localStorage` so that reloading the page doesn't start over. No cookies are set and
nothing is sent to a server.

## What is stored

| Key           | Contents                                                     | Written by                                     |
| ------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| `flavours`    | The whole board as a JSON array of flavours (see [the data model](board.md#data-model)). | `src/App.tsx`                                  |
| `i18nextLng`  | The selected UI language, e.g. `nl`.                         | `i18next-browser-languagedetector` (`src/i18n.tsx`) |

## Saving

Every change to the `flavours` atom — a click, an edit, an import or a reset — writes the
complete board to `localStorage["flavours"]`. An empty board is never written, so the
saved board is not wiped while the app is still loading. The board's rotation is not
stored.

## Loading

On startup the app reads `localStorage["flavours"]`:

- If a board is stored, it is restored as-is.
- Otherwise the default board is fetched from `public/flavours.json` and every flavour is
  set to `NO`.

The UI language is restored by the language detector; without a stored choice it
follows the browser's language, falling back to English.

## Resetting

**Reset** asks for confirmation (`ResetConfirmationModal`), then loads the default board
from `public/flavours.json` with every flavour set to `NO`. The default board then
overwrites the saved board, so customizations and selections are lost — export the board
first (see [Markdown format](markdown-format.md)) to keep a copy.

To clear everything, including the language choice, clear the site data in the browser.

## Caveats

- Storage is per browser and per device: a board doesn't follow the visitor to another
  browser. Use export and import to move it.
- Private browsing modes may discard `localStorage` when the window closes.
- When `flavours.json` changes (new or renamed default flavours), visitors with a saved
  board keep their old board until they reset.
