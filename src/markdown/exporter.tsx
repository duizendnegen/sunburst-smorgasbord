import Flavour from "../interfaces";
import i18n from "../i18n";
import { BOARD_NAME } from "../constants";

/**
 * Serializes the internal data format into a Sunburst Smorgasbord markdown document.
 * Format spec (source of truth): docs/markdown-format.md
 */
export const exportMarkdown = (flavours: Flavour[]): string => {
  let root: Flavour | undefined;
  const childrenByParent = new Map<string, Flavour[]>();

  for (const flavour of flavours) {
    if (flavour.parentUuid === "") {
      root = flavour;
    } else {
      const siblings = childrenByParent.get(flavour.parentUuid) ?? [];
      siblings.push(flavour);
      childrenByParent.set(flavour.parentUuid, siblings);
    }
  }

  if (!root) {
    return "";
  }

  // The " - <language>" suffix records the document language.
  const lng = i18n.language;
  const lines: string[] = [
    `# ${BOARD_NAME} - ${i18n.t("board.language", { lng })}`,
  ];

  // Keyed nodes are translated into the active UI language; others use their stored name.
  const label = (flavour: Flavour): string => {
    return flavour.key ? i18n.t(`flavours.${flavour.key}`) : (flavour.name ?? "");
  };

  const state = (flavour: Flavour): string => {
    return flavour.state ?? "NO";
  };

  const walkListItems = (node: Flavour, indent: number): void => {
    const children = childrenByParent.get(node.uuid) ?? [];
    for (const child of children) {
      lines.push(`${"  ".repeat(indent)}- ${label(child)} (${state(child)})`);
      walkListItems(child, indent + 1);
    }
  };

  // Children of the root become h2 headers; everything deeper is a list item.
  const primaries = childrenByParent.get(root.uuid) ?? [];
  for (const primary of primaries) {
    lines.push("");
    lines.push(`## ${label(primary)} (${state(primary)})`);
    walkListItems(primary, 0);
  }

  return lines.join("\n") + "\n";
};
