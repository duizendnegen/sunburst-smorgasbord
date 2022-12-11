import * as d3 from "d3";
import { selector } from "recoil";
import Flavour from "../interfaces";
import flavoursState from "./flavours.atom";

const hierarchicalFlavoursState = selector({
  key: 'hierarchicalFlavours',
  get: ({get}) => {
    const flavours = get(flavoursState);

    if(!flavours || flavours.length === 0) {
      return null;
    }
    
    return d3.stratify<Flavour>()
      .id(d => d.uuid)
      .parentId(d => d.parentUuid)
        (flavours);
  }
});

export default hierarchicalFlavoursState;