import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { RecoilRoot } from "recoil";
import Smorgasbord from "./Smorgasbord";
import flavoursState from "../../states/flavours.atom";
import Flavour from "../../interfaces";
import flavours from "./../../fixtures/testFlavours.json";
import i18n from "../../i18n.tests";

// jsdom has no PointerEvent, so fireEvent.pointer* would drop clientX/clientY;
// back it with MouseEvent, which carries the coordinates.
if (!window.PointerEvent) {
  (window as any).PointerEvent = class PointerEvent extends MouseEvent {};
}

const renderBoard =(onElementClick: (uuid: string) => void, board: Flavour[] = flavours) : ReturnType<typeof render> => {
  return render(
    <RecoilRoot initializeState={({ set }) : void => set(flavoursState, board)}>
      <I18nextProvider i18n={i18n}>
        <Smorgasbord onElementClick={onElementClick} />
      </I18nextProvider>
    </RecoilRoot>);
};

const svg = () : Element => document.querySelector("#smorgasbordImage");

// Non-root slices; the root node is not clickable and is never rotated.
const sliceGroups = () : Element[] => Array.from(document.querySelectorAll("#smorgasbordImage > g"))
  .filter(group => !group.classList.contains("flavour-root-node"));

const rootGroup = () : Element => document.querySelector(".flavour-root-node");

describe("Smorgasbord rendering", () => {
  it("renders one slice per flavour", () => {
    renderBoard(jest.fn());

    expect(document.querySelectorAll("#smorgasbordImage > g")).toHaveLength(flavours.length);
    expect(rootGroup()).not.toBeNull();
  });

  it("labels keyed flavours by translation and unkeyed flavours by name", () => {
    renderBoard(jest.fn(), [
      { uuid: "root", parentUuid: "", key: "our_relationship_includes" },
      { uuid: "a", parentUuid: "root", key: "creativity" },
      { uuid: "b", parentUuid: "root", name: "Custom flavour" }
    ]);

    const labels = Array.from(document.querySelectorAll("#smorgasbordImage text")).map(text => text.textContent);
    expect(labels).toContain("Creativity");
    expect(labels).toContain("Custom flavour");
  });

  it("colours flavours by state", () => {
    renderBoard(jest.fn(), [
      { uuid: "root", parentUuid: "", name: "Root" },
      { uuid: "no", parentUuid: "root", name: "No", state: "NO" },
      { uuid: "yes", parentUuid: "root", name: "Yes", state: "YES" }
    ]);

    const fillOf = (name: string) : string => Array.from(document.querySelectorAll("#smorgasbordImage > g"))
      .find(group => group.textContent === name)
      .querySelector("path")
      .getAttribute("fill");

    expect(fillOf("Root")).toBe("#1F1F1F");
    expect(fillOf("No")).toBe("#000");
    expect(fillOf("Yes")).not.toBe("#000");
  });

  it("renders nothing for an empty board", () => {
    renderBoard(jest.fn(), []);

    expect(document.querySelectorAll("#smorgasbordImage > g")).toHaveLength(0);
  });
});

describe("Smorgasbord clicks", () => {
  it("clicks a slice on press and release at the same point", () => {
    const onClick = jest.fn();
    renderBoard(onClick);
    const group = sliceGroups()[0];

    fireEvent.pointerDown(group, { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(group, { clientX: 5, clientY: 5 });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not click the root node", () => {
    const onClick = jest.fn();
    renderBoard(onClick);

    fireEvent.pointerDown(rootGroup(), { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(rootGroup(), { clientX: 5, clientY: 5 });

    expect(onClick).not.toHaveBeenCalled();
  });

  it("treats a slightly drifting pointer as a click and does not rotate", () => {
    const onClick = jest.fn();
    renderBoard(onClick);
    const group = sliceGroups()[0];

    // 3.6px drift, inside the 10px threshold.
    fireEvent.pointerDown(group, { clientX: 5, clientY: 5 });
    fireEvent.mouseMove(svg(), { clientX: 8, clientY: 7 });
    expect(group.getAttribute("transform")).toBe("rotate(0)");

    fireEvent.pointerUp(group, { clientX: 8, clientY: 7 });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(group.getAttribute("transform")).toBe("rotate(0)");
  });

  it("rotates the board past the threshold and does not click", () => {
    const onClick = jest.fn();
    renderBoard(onClick);
    const group = sliceGroups()[0];

    // ~35px move past the 10px threshold at a different angle around the
    // board center (jsdom reports all-zero rects, so the center is the
    // origin — points on one ray would yield zero rotation): this is a
    // rotation, not a click.
    fireEvent.pointerDown(group, { clientX: 5, clientY: 5 });
    fireEvent.mouseMove(svg(), { clientX: 40, clientY: 10 });
    expect(group.getAttribute("transform")).not.toBe("rotate(0)");

    fireEvent.pointerUp(group, { clientX: 40, clientY: 10 });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("ignores mouse moves without an active drag", () => {
    renderBoard(jest.fn());

    fireEvent.mouseMove(svg(), { clientX: 40, clientY: 10 });

    expect(sliceGroups()[0].getAttribute("transform")).toBe("rotate(0)");
  });

  it("ends the drag when the pointer leaves the board", () => {
    const onClick = jest.fn();
    renderBoard(onClick);
    const group = sliceGroups()[0];

    fireEvent.pointerDown(group, { clientX: 5, clientY: 5 });
    fireEvent.pointerLeave(svg(), { clientX: 5, clientY: 5 });
    fireEvent.mouseMove(svg(), { clientX: 40, clientY: 10 });

    expect(group.getAttribute("transform")).toBe("rotate(0)");
    expect(onClick).not.toHaveBeenCalled();
  });
});
