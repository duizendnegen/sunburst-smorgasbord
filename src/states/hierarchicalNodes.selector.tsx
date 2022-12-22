import * as d3 from "d3";
import { selector } from "recoil";
import Flavour from "../interfaces";
import flavoursState from "./flavours.atom";
import { radius } from "../constants";
import { findAllDescendants } from "../helpers";

const hierarchicalNodesState = selector({
  key: "hierarchicalNodesState",
  get: ({get}) => {
    const flavours = get(flavoursState);

    if (!flavours || flavours.length === 0) {
      return [];
    }

    const flavoursWithValues = flavours.map(flavour => {
      return {
        ...flavour,
        value: findAllDescendants(flavours, flavour.uuid).length === 0 ? 1000 : 0
      }
    });
    
    let hierarchicalFlavours = d3.stratify<Flavour>()
      .id(d => d.uuid)
      .parentId(d => d.parentUuid)(flavoursWithValues);

    hierarchicalFlavours.sum(d => Math.max(0, d.value));
    hierarchicalFlavours.sort((a, b) => d3.descending(a.value, b.value));

    const partition = d3.partition<Flavour>().size([2 * Math.PI, radius])(hierarchicalFlavours);

    hierarchicalFlavours.children.forEach((child: any, i: number) => {
      child.index = i;
    });

    // construct the color scale and set on each node
    let colorScale = d3.scaleSequential([0, hierarchicalFlavours.children.length], d3.interpolateRainbow).unknown("#1b1b1b");
    hierarchicalFlavours.descendants().forEach((child: any) => {
      child.color = d3.color(colorScale(child.ancestors().reverse()[1]?.index));
    });

    return partition.descendants();
  }
});

export default hierarchicalNodesState;