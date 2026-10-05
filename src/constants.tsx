export const diameter = 1152;
export const radius = diameter / 2;
export const padding = 1;

// The board name is not translated; it is the h1 title of the markdown export
// (see docs/markdown-format.md).
export const BOARD_NAME = "Sunburst Smorgasbord";

// The root node is not part of the markdown document (the h1 is the board
// name); importing synthesizes it with this fixed identity, as in public/flavours.json.
export const ROOT_FLAVOUR = {
  key: "our_relationship_includes",
  name: "Our relationship includes..."
};
