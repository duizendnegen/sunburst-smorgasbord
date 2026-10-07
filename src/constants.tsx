export const diameter = 1152;
export const radius = diameter / 2;
export const padding = 1;

// The board name is not translated; it is the h1 title of the markdown export
// (see docs/markdown-format.md).
// Languages offered in the footer, each named in its own language so visitors
// can find theirs whatever language is active.
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "nl", name: "Nederlands" }
];

export const BOARD_NAME = "Sunburst Smorgasbord";

// The root node is not part of the markdown document (the h1 is the board
// name); importing synthesizes it with this fixed identity, as in public/flavours.json.
export const ROOT_FLAVOUR = {
  key: "our_relationship_includes",
  name: "Our relationship includes..."
};
