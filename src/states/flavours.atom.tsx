import { atom } from "recoil";

const flavoursState = atom({
  key: 'flavours',
  default: []
});

export default flavoursState;