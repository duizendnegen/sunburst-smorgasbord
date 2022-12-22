import Flavour from "./interfaces";

export const findAllDescendants = (flavours, flavourUuid) : Flavour[] => {
  let children = flavours
    .filter(flavour => flavour.parentUuid === flavourUuid)
    .map(flavour => flavour.uuid);

  let descendants = children.flatMap(uuid => findAllDescendants(flavours, uuid));

  return children.concat(descendants);
}