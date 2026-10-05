// The app's i18n instance loads its locales over http, which does not work in
// the test environment; use the file-based test instance instead (all locales
// are preloaded synchronously).
jest.mock("../i18n", () => require("../i18n.tests"));
import { exportMarkdown } from "./exporter";
import { importMarkdown } from "./importer";
import i18n from "../i18n";
import Flavour from "../interfaces";

// The example from docs/markdown-format.md (source of truth for the format).
const docExample = `# Sunburst Smorgasbord - English

## Kink (YES)
- Body contact (YES)
  - Deep pressure (NO)
- Cuddles (MAYBE)

## Creativity (YES)
- Projects (YES)

## Communication (MAYBE)
`;

const byName = (flavours: Flavour[]): Map<string, Flavour> => {
  return new Map(flavours.map((flavour): [string, Flavour] => [flavour.name ?? "", flavour]));
};

describe("importMarkdown", () => {
  it("parses the example from docs/markdown-format.md", () => {
    const board = importMarkdown(docExample);

    // The root node is synthesized with its fixed identity.
    const root = board.find(flavour => flavour.parentUuid === "");
    expect(root).toBeDefined();
    expect(root?.key).toBe("our_relationship_includes");
    expect(root?.name).toBe("Our relationship includes...");

    const nodes = byName(board);

    // Hierarchy: primary nodes hang off the root, list items off their parent.
    expect(nodes.get("Kink")?.parentUuid).toBe(root?.uuid);
    expect(nodes.get("Creativity")?.parentUuid).toBe(root?.uuid);
    expect(nodes.get("Communication")?.parentUuid).toBe(root?.uuid);
    expect(nodes.get("Body contact")?.parentUuid).toBe(nodes.get("Kink")?.uuid);
    expect(nodes.get("Cuddles")?.parentUuid).toBe(nodes.get("Kink")?.uuid);
    expect(nodes.get("Deep pressure")?.parentUuid).toBe(nodes.get("Body contact")?.uuid);
    expect(nodes.get("Projects")?.parentUuid).toBe(nodes.get("Creativity")?.uuid);

    // States.
    expect(nodes.get("Kink")?.state).toBe("YES");
    expect(nodes.get("Body contact")?.state).toBe("YES");
    expect(nodes.get("Deep pressure")?.state).toBe("NO");
    expect(nodes.get("Cuddles")?.state).toBe("MAYBE");
    expect(nodes.get("Creativity")?.state).toBe("YES");
    expect(nodes.get("Projects")?.state).toBe("YES");
    expect(nodes.get("Communication")?.state).toBe("MAYBE");
  });

  it("defaults missing or unrecognized states to NO", () => {
    const board = importMarkdown("# Sunburst Smorgasbord\n\n## Kink\n\n- Body contact (Sometimes)\n");

    const nodes = byName(board);
    expect(nodes.get("Kink")?.state).toBe("NO");
    expect(nodes.get("Body contact")?.state).toBe("NO");
  });

  it("propagates a child's state up to all of its ancestors", () => {
    const board = importMarkdown(`# Sunburst Smorgasbord - Deutsch

## Pflege (NO)
- Gegenseitig (NO)
  - Notfälle (NO)
- Andere (NO)
  - Pflanzen (NO)
    - Pflanzen (NO)
      - Pflanzen (YES)
`);

    // The whole branch above the YES leaf becomes YES, mirroring the app's
    // invariant (see handleElementClick in App.tsx).
    expect(board.filter(flavour => flavour.name === "Pflanzen").every(flavour => flavour.state === "YES")).toBe(true);

    const nodes = byName(board);
    expect(nodes.get("Andere")?.state).toBe("YES");
    expect(nodes.get("Pflege")?.state).toBe("YES");

    // Unrelated branches keep their states.
    expect(nodes.get("Gegenseitig")?.state).toBe("NO");
    expect(nodes.get("Notfälle")?.state).toBe("NO");
  });

  it("propagates MAYBE up to its ancestors", () => {
    const board = importMarkdown(`# Sunburst Smorgasbord

## Kink (NO)
- Body contact (MAYBE)
`);

    const nodes = byName(board);
    expect(nodes.get("Body contact")?.state).toBe("MAYBE");
    expect(nodes.get("Kink")?.state).toBe("MAYBE");
  });

  it("matches states case-insensitively", () => {
    const board = importMarkdown("# Sunburst Smorgasbord\n\n## Kink (yEs)\n\n- Body contact (mAyBe)\n");

    const nodes = byName(board);
    expect(nodes.get("Kink")?.state).toBe("YES");
    expect(nodes.get("Body contact")?.state).toBe("MAYBE");
  });

  it("synthesizes the root when the h1 is missing", () => {
    const board = importMarkdown("## Kink (MAYBE)\n\n- Body contact (YES)\n");

    const root = board.find(flavour => flavour.parentUuid === "");
    expect(root).toBeDefined();
    expect(root?.key).toBe("our_relationship_includes");
    expect(byName(board).get("Kink")?.parentUuid).toBe(root?.uuid);
  });

  it("attaches list items without a preceding h2 to the root as siblings", () => {
    const board = importMarkdown("# Sunburst Smorgasbord\n\n- Kink (MAYBE)\n\n- Cuddles (YES)\n");

    const root = board.find(flavour => flavour.parentUuid === "");
    const nodes = byName(board);
    expect(nodes.get("Kink")?.parentUuid).toBe(root?.uuid);
    expect(nodes.get("Cuddles")?.parentUuid).toBe(root?.uuid);
  });

  it("keeps deeply indented items attached to their parent", () => {
    const board = importMarkdown("# Sunburst Smorgasbord\n\n## Kink (MAYBE)\n\n- Toys (YES)\n  - Whip (NO)\n    - Heavy (MAYBE)\n");

    const nodes = byName(board);
    expect(nodes.get("Whip")?.parentUuid).toBe(nodes.get("Toys")?.uuid);
    expect(nodes.get("Heavy")?.parentUuid).toBe(nodes.get("Whip")?.uuid);
  });

  it("ignores free text", () => {
    const board = importMarkdown("# Sunburst Smorgasbord\n\n## Kink (MAYBE)\nSome notes about kink.\n\n- Body contact (YES)\n");

    expect(board).toHaveLength(3); // root + Kink + Body contact
    expect(byName(board).get("Some notes about kink.")).toBeUndefined();
  });

  it("throws for an empty document", () => {
    expect(() => importMarkdown("")).toThrow(/no importable items/);
  });

  it("throws for a document with only blank lines", () => {
    expect(() => importMarkdown("\n\n   \n\n")).toThrow(/no importable items/);
  });

  it("throws for a document without any recognizable structure", () => {
    expect(() => importMarkdown("# Sunburst Smorgasbord\n\nSome notes about the board.\n")).toThrow(/no importable items/);
  });
});

describe("exportMarkdown", () => {
  it("returns an empty string for a board without a root", () => {
    expect(exportMarkdown([])).toBe("");
  });

  it("round-trips the example from docs/markdown-format.md", () => {
    const board = importMarkdown(docExample);
    expect(exportMarkdown(board)).toBe(docExample);
  });

  it("exports keyed nodes translated and user-added names verbatim", () => {
    const board: Flavour[] = [
      { uuid: "root", parentUuid: "", name: "Our relationship includes...", key: "our_relationship_includes" },
      { uuid: "kink", parentUuid: "root", name: "Kink", key: "kink", state: "MAYBE" },
      { uuid: "custom", parentUuid: "kink", name: "My own practice", state: "YES" }
    ];

    const exported = exportMarkdown(board);
    expect(exported).toContain("# Sunburst Smorgasbord - English");
    expect(exported).toContain("## Kink (MAYBE)");
    expect(exported).toContain("- My own practice (YES)");
  });
});

describe("localized export/import", () => {
  afterEach(() : void => {
    void i18n.changeLanguage("en");
  });

  it("exports in the active language and re-imports its own output", async () => {
    await i18n.changeLanguage("de");

    const board: Flavour[] = [
      { uuid: "root", parentUuid: "", name: "Our relationship includes...", key: "our_relationship_includes" },
      { uuid: "kink", parentUuid: "root", name: "Kink", key: "kink", state: "MAYBE" },
      { uuid: "creativity", parentUuid: "root", name: "Creativity", key: "creativity", state: "NO" }
    ];

    const exported = exportMarkdown(board);
    expect(exported).toContain("# Sunburst Smorgasbord - Deutsch");
    expect(exported).toContain("## Kink (MAYBE)");
    expect(exported).toContain("## Kreativität (NO)");

    const reimported = importMarkdown(exported);
    const nodes = byName(reimported);
    expect(nodes.get("Kink")?.state).toBe("MAYBE");
    expect(nodes.get("Kreativität")?.state).toBe("NO");
  });
});
