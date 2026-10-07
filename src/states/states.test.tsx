import { snapshot_UNSTABLE } from "recoil";
import flavoursState from "./flavours.atom";
import hierarchicalFlavoursState from "./hierarchicalFlavours.selector";
import hierarchicalNodesState from "./hierarchicalNodes.selector";
import { radius } from "../constants";
import flavours from "../fixtures/testFlavours.json";

const snapshotWith = (board) : ReturnType<typeof snapshot_UNSTABLE> =>
  snapshot_UNSTABLE(({ set }) => set(flavoursState, board));

describe("hierarchicalFlavoursState", () => {
  it("is null without flavours", () => {
    expect(snapshotWith([]).getLoadable(hierarchicalFlavoursState).getValue()).toBeNull();
  });

  it("builds the tree from parent references", () => {
    const tree = snapshotWith(flavours).getLoadable(hierarchicalFlavoursState).getValue();

    expect(tree.data.key).toBe("our_relationship_includes");
    expect(tree.descendants()).toHaveLength(flavours.length);
    expect(tree.children.map(child => child.data.key).sort()).toEqual(["collaboration", "labels"]);
  });

  it("throws for a board with more than one root", () => {
    const board = [
      { uuid: "a", parentUuid: "" },
      { uuid: "b", parentUuid: "" }
    ];

    expect(() : void => { snapshotWith(board).getLoadable(hierarchicalFlavoursState).getValue(); }).toThrow();
  });
});

describe("hierarchicalNodesState", () => {
  it("is empty without flavours", () => {
    expect(snapshotWith([]).getLoadable(hierarchicalNodesState).getValue()).toEqual([]);
  });

  it("partitions the full circle among the root's children", () => {
    const nodes = snapshotWith(flavours).getLoadable(hierarchicalNodesState).getValue();
    const root = nodes.find(node => node.depth === 0);

    expect(nodes).toHaveLength(flavours.length);
    expect(root.x0).toBe(0);
    expect(root.x1).toBeCloseTo(2 * Math.PI);
    expect(Math.max(...nodes.map(node => node.y1))).toBeCloseTo(radius);
  });

  it("sizes slices by their number of leaves", () => {
    const nodes = snapshotWith(flavours).getLoadable(hierarchicalNodesState).getValue();
    const angle = (key: string) : number => {
      const node = nodes.find(node => node.data.key === key);
      return node.x1 - node.x0;
    };

    // collaboration and labels each have two leaves; their children one each.
    expect(angle("collaboration")).toBeCloseTo(Math.PI);
    expect(angle("labels")).toBeCloseTo(Math.PI);
    expect(angle("comet")).toBeCloseTo(Math.PI / 2);
  });

  it("gives each primary branch its own colour, shared with its descendants", () => {
    const nodes = snapshotWith(flavours).getLoadable(hierarchicalNodesState).getValue();
    const colourOf = (key: string) : string => (nodes.find(node => node.data.key === key) as any).color.toString();

    expect(colourOf("collaboration")).not.toBe(colourOf("labels"));
    expect(colourOf("creativity")).toBe(colourOf("collaboration"));
    expect(colourOf("comet")).toBe(colourOf("labels"));
  });
});
