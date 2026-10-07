import * as d3 from "d3";
import Flavour from "./interfaces";

export const findAllDescendants = (flavours, flavourUuid) : Flavour[] => {
  let children = flavours
    .filter(flavour => flavour.parentUuid === flavourUuid)
    .map(flavour => flavour.uuid);

  let descendants = children.flatMap(uuid => findAllDescendants(flavours, uuid));

  return children.concat(descendants);
}

// Cycles the clicked flavour NO -> YES -> MAYBE -> NO and propagates the new
// state through the tree, so a flavour's state never exceeds its parent's.
export const cycleFlavourState = (flavours: Flavour[], hierarchicalFlavours: d3.HierarchyNode<Flavour>, uuid: string) : Flavour[] => {
  // find the target flavour
  let targetFlavour = flavours.find(flavour => flavour.uuid === uuid);
  let targetHierarchicalFlavour = hierarchicalFlavours.find(hierarchicalFlavour => hierarchicalFlavour.data.uuid === targetFlavour.uuid);

  // ignore root click
  if (targetHierarchicalFlavour.ancestors().length === 1) {
    return flavours;
  }

  let oldState = targetFlavour.state;
  let newState = oldState === "NO" ? "YES"
    : oldState === "YES" ? "MAYBE"
      : "NO";

  return flavours.map((flavour): Flavour => {
    if (flavour.uuid === uuid) {
      return {
        ...flavour,
        state: newState
      }
    } else {
      let hierarchicalFlavour = hierarchicalFlavours.find(hierarchicalFlavour => hierarchicalFlavour.data.uuid === flavour.uuid);
      if (
        (
          newState === "NO" // 'NO'? Update all children to that
          && hierarchicalFlavour.ancestors().some(ancestor => ancestor.data.uuid === targetFlavour.uuid)
        ) ||
        (
          newState === "YES" // 'YES'? Update the parents to that
          && hierarchicalFlavour.descendants().some(child => child.data.uuid === targetFlavour.uuid)
        ) ||
        (
          newState === "MAYBE" // 'MAYBE'? Update the children that have 'YES' to that
          && hierarchicalFlavour.ancestors().some(ancestor => ancestor.data.uuid === targetFlavour.uuid && hierarchicalFlavour.data.state === "YES")
        )) {
        return {
          ...flavour,
          state: newState
        }
      }
    }

    return flavour;
  });
}
