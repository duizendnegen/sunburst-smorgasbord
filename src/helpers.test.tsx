import * as d3 from "d3";
import { cycleFlavourState, findAllDescendants } from "./helpers";
import Flavour from "./interfaces";

// root
// ├── kink
// │   ├── body_contact
// │   │   └── deep_pressure
// │   └── cuddles
// └── creativity
const board: Flavour[] = [
  { uuid: "root", parentUuid: "", name: "Root", state: "NO" },
  { uuid: "kink", parentUuid: "root", name: "Kink", state: "NO" },
  { uuid: "body_contact", parentUuid: "kink", name: "Body contact", state: "NO" },
  { uuid: "deep_pressure", parentUuid: "body_contact", name: "Deep pressure", state: "NO" },
  { uuid: "cuddles", parentUuid: "kink", name: "Cuddles", state: "NO" },
  { uuid: "creativity", parentUuid: "root", name: "Creativity", state: "NO" }
];

const withStates = (states: { [uuid: string]: string }) : Flavour[] =>
  board.map(flavour => ({ ...flavour, state: states[flavour.uuid] ?? flavour.state }));

const click = (flavours: Flavour[], uuid: string) : { [uuid: string]: string } => {
  const hierarchicalFlavours = d3.stratify<Flavour>()
    .id(d => d.uuid)
    .parentId(d => d.parentUuid)(flavours);

  return Object.fromEntries(cycleFlavourState(flavours, hierarchicalFlavours, uuid)
    .map(flavour => [flavour.uuid, flavour.state]));
};

describe("findAllDescendants", () => {
  it("finds children and deeper descendants", () => {
    expect(findAllDescendants(board, "kink").sort())
      .toEqual(["body_contact", "cuddles", "deep_pressure"]);
  });

  it("returns nothing for a leaf", () => {
    expect(findAllDescendants(board, "creativity")).toEqual([]);
  });

  it("returns every non-root flavour for the root", () => {
    expect(findAllDescendants(board, "root")).toHaveLength(board.length - 1);
  });
});

describe("cycleFlavourState", () => {
  it("cycles NO -> YES -> MAYBE -> NO", () => {
    let flavours = withStates({});
    const states = [];

    for (let i = 0; i < 3; i++) {
      const next = click(flavours, "creativity");
      states.push(next.creativity);
      flavours = flavours.map(flavour => ({ ...flavour, state: next[flavour.uuid] }));
    }

    expect(states).toEqual(["YES", "MAYBE", "NO"]);
  });

  it("treats a flavour without a state as NO", () => {
    const flavours = board.map(flavour => ({ ...flavour, state: undefined }));

    expect(click(flavours, "creativity").creativity).toBe("NO");
  });

  it("ignores clicks on the root", () => {
    const flavours = withStates({});

    expect(cycleFlavourState(flavours, d3.stratify<Flavour>()
      .id(d => d.uuid)
      .parentId(d => d.parentUuid)(flavours), "root")).toBe(flavours);
  });

  it("sets all ancestors to YES when a flavour becomes YES", () => {
    const next = click(withStates({}), "deep_pressure");

    expect(next).toEqual({
      root: "YES",
      kink: "YES",
      body_contact: "YES",
      deep_pressure: "YES",
      cuddles: "NO",
      creativity: "NO"
    });
  });

  it("downgrades YES descendants to MAYBE when a flavour becomes MAYBE", () => {
    const next = click(withStates({
      root: "YES", kink: "YES", body_contact: "YES", deep_pressure: "YES", cuddles: "NO"
    }), "kink");

    expect(next.kink).toBe("MAYBE");
    expect(next.body_contact).toBe("MAYBE");
    expect(next.deep_pressure).toBe("MAYBE");
    expect(next.cuddles).toBe("NO"); // not YES, so left alone
    expect(next.root).toBe("YES"); // ancestors are untouched
  });

  it("sets all descendants to NO when a flavour becomes NO", () => {
    const next = click(withStates({
      root: "YES", kink: "MAYBE", body_contact: "MAYBE", deep_pressure: "MAYBE", cuddles: "NO"
    }), "kink");

    expect(next.kink).toBe("NO");
    expect(next.body_contact).toBe("NO");
    expect(next.deep_pressure).toBe("NO");
    expect(next.root).toBe("YES");
  });

  it("does not mutate the input", () => {
    const flavours = withStates({});
    const snapshot = JSON.parse(JSON.stringify(flavours));

    click(flavours, "deep_pressure");

    expect(flavours).toEqual(snapshot);
  });
});
