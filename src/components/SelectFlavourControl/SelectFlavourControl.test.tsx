import { render, screen } from "@testing-library/react";
import * as d3 from "d3";
import { I18nextProvider } from "react-i18next";
import flavours from "./../../fixtures/testFlavours.json";
import Flavour from "../../interfaces";
import i18n from "../../i18n.tests";
import SelectFlavourControl from "./SelectFlavourControl";

let hierarchicalFlavours = null;

beforeEach(() => {
  hierarchicalFlavours = d3.stratify<Flavour>()
    .id(d => d.uuid)
    .parentId(d => d.parentUuid)(flavours)
    .descendants();
});

it("renders the flavours selection", async () => {
  render(
    <I18nextProvider i18n={i18n}>
      <SelectFlavourControl
        onChange={() : void => {}}
        value=''
        hierarchicalFlavours={hierarchicalFlavours} />
    </I18nextProvider>);

  expect(screen.getByRole("combobox")).toBeInTheDocument();
});

it("sorts the flavours alphabetically", async () => {
  render(
    <I18nextProvider i18n={i18n}>
      <SelectFlavourControl
        onChange={() : void => {}}
        value=''
        hierarchicalFlavours={hierarchicalFlavours} />
    </I18nextProvider>);

  let options = screen.getAllByRole("option");

  let collaborationOption = options.find(option => option.textContent === "Collaboration");
  let labelsOption = options.find(option => option.textContent === "Labels");
  expect(options.indexOf(collaborationOption)).toBeLessThan(options.indexOf(labelsOption));

  let creativityOption = options.find(option => option.textContent === "Collaboration > Creativity");
  let organizationOption = options.find(option => option.textContent === "Collaboration > Organization");
  expect(options.indexOf(creativityOption)).toBeLessThan(options.indexOf(organizationOption));
});

it("renders the flavour descriptions nested hierarchically", async () => {
  render(
    <I18nextProvider i18n={i18n}>
      <SelectFlavourControl
        onChange={() : void => {}}
        value=''
        hierarchicalFlavours={hierarchicalFlavours} />
    </I18nextProvider>);

  expect(screen.getByRole("option", { name: "Collaboration > Creativity" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Collaboration > Organization" })).toBeInTheDocument();
});