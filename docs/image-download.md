# Image Download

**Download as image** (`src/components/ExportAsImageButton/ExportAsImageButton.tsx`)
saves the board as `sunburst-smorgasbord.png`, meant for sharing the result with others.

## What the image shows

- The board as it is currently shown, including its rotation and the active language.
- Only what the relationship includes: flavours set to `NO` (and their labels) are made
  transparent. `YES` and `MAYBE` flavours keep their colours. The root stays visible.
- A transparent background, at 2304 × 2304 pixels (twice the board's 1152px size).

## How it works

The board is an SVG (`#smorgasbordImage`), which is turned into a PNG entirely in the
browser:

1. Clone the SVG, so the board on the page is untouched.
2. Hide `NO` flavours in the clone: every `path` with `fill="#000"` and its label get a
   fill opacity of 0.
3. Inline the CSS rules from the page's stylesheets that match the SVG's ids and classes,
   so the image doesn't depend on the page's styling.
4. Serialize the SVG to a string and load it into an `Image` via a base64 `data:` URL.
5. Draw the image onto a 2304 × 2304 canvas and convert it to a PNG blob.
6. Save the blob with [`file-saver`](https://github.com/eligrey/FileSaver.js).

## Caveats

- `NO` flavours are found by their fill colour rather than their state, so changing the
  `NO` colour in `Smorgasbord.tsx` must be matched here (there is a TODO for this).
- Labels use the `sans-serif` font set on the SVG, so the exact font depends on the
  viewer's system.
