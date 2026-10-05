import { v4 as uuidv4 } from "uuid";
import Flavour from "../interfaces";
import { ROOT_FLAVOUR } from "../constants";
import { parseState } from "./states";

/**
 * Parses a Sunburst Smorgasbord markdown document into the internal data format.
 * Format spec (source of truth): docs/markdown-format.md
 */
export const importMarkdown = (markdown: string): Flavour[] => {
  // Synthesize the root node (not part of the document) so the tree stays connected.
  const root: Flavour = { uuid: uuidv4(), parentUuid: "", ...ROOT_FLAVOUR };
  const flavours: Flavour[] = [root];

  // The app's invariant (see handleElementClick in App.tsx): a node's state
  // never exceeds its parent's — YES propagates up to all ancestors, NO down.
  const stateRank: Record<string, number> = { "NO": 0, "MAYBE": 1, "YES": 2 };

  // Ancestors of the next item, innermost last; each records its parsed level.
  const stack: Array<{ flavour: Flavour, level: number }> = [{ flavour: root, level: 1 }];

  const attach = (text: string, level: number): void => {
    // An item attaches to the most recent item at a shallower level.
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    // Split strings like "Kink (MAYBE)" into a name and a state.
    const match = text.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
    const flavour: Flavour = {
      uuid: uuidv4(),
      parentUuid: stack[stack.length - 1].flavour.uuid,
      name: (match ? match[1] : text).trim(),
      state: match ? parseState(match[2]) : "NO"
    };

    flavours.push(flavour);
    stack.push({ flavour, level });
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    if (rawLine.trim() === "") {
      continue; // blank lines are ignored
    }

    const headerMatch = rawLine.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      if (level === 1) {
        continue; // the h1 is the board name; its content is not part of the data
      }
      attach(headerMatch[2].trim(), level);
      continue;
    }

    const listItemMatch = rawLine.match(/^(\s*)- (.*)$/);
    if (listItemMatch) {
      // Two spaces of indentation = one level deeper; list items sit under the h2s.
      const indent = Math.floor(listItemMatch[1].length / 2);
      attach(listItemMatch[2].trim(), indent + 3);
      continue;
    }

    // Free text is not part of the format; ignore it.
  }

  // A document without any recognizable structure (empty, blank-only, or
  // free text only) is invalid; throw so the caller's error state triggers.
  if (flavours.length === 1) {
    throw new Error("Markdown document contains no importable items");
  }

  // Restore the invariant: lift each node's state up to its ancestors, so a
  // "YES" leaf renders together with its whole branch (as in the app).
  const byUuid = new Map(flavours.map((flavour): [string, Flavour] => [flavour.uuid, flavour]));
  for (const flavour of flavours) {
    let cursor = byUuid.get(flavour.parentUuid);
    while (cursor) {
      if ((stateRank[flavour.state] ?? 0) > (stateRank[cursor.state] ?? 0)) {
        cursor.state = flavour.state;
      }
      cursor = byUuid.get(cursor.parentUuid);
    }
  }

  return flavours;
};
