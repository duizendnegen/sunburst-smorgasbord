import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { RecoilRoot, useRecoilValue } from "recoil";
import EditModal from "./EditModal";
import flavoursState from "../../states/flavours.atom";
import Flavour from "../../interfaces";
import i18n from "../../i18n.tests";

const board: Flavour[] = [
  { uuid: "root", parentUuid: "", key: "our_relationship_includes", state: "NO" },
  { uuid: "labels", parentUuid: "root", key: "labels", state: "NO" },
  { uuid: "comet", parentUuid: "labels", key: "comet", state: "NO" },
  { uuid: "chosen_family", parentUuid: "labels", key: "chosen_family", state: "NO" },
  { uuid: "creativity", parentUuid: "root", key: "creativity", state: "NO" }
];

// Reports every change of the flavours atom.
const FlavoursObserver = ({ onChange }) : JSX.Element => {
  const flavours = useRecoilValue(flavoursState);

  useEffect(() : void => {
    onChange(flavours);
  }, [ flavours, onChange ]);

  return null;
};

const renderModal = (props: { isActive?: boolean, onClose?: () => void } = {}) : { latest: () => Flavour[] } => {
  const onChange = jest.fn();

  render(
    <RecoilRoot initializeState={({ set }) : void => set(flavoursState, board)}>
      <I18nextProvider i18n={i18n}>
        <EditModal isActive={props.isActive ?? true} onClose={props.onClose ?? jest.fn()} />
        <FlavoursObserver onChange={onChange} />
      </I18nextProvider>
    </RecoilRoot>);

  return { latest: () : Flavour[] => onChange.mock.calls[onChange.mock.calls.length - 1][0] };
};

describe("EditModal", () => {
  it("is only shown when active", () => {
    renderModal({ isActive: false });

    expect(document.querySelector(".modal")).not.toHaveClass("is-active");
  });

  it("closes from the close button, the cross and the background", () => {
    const onClose = jest.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByLabelText("close"));
    fireEvent.click(document.querySelector(".modal-background"));

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("adds a flavour as YES and sets its ancestors to YES", () => {
    const { latest } = renderModal();

    fireEvent.change(screen.getByLabelText("New flavour name"), { target: { value: "Stargazing" } });
    fireEvent.change(screen.getByLabelText("Parent element"), { target: { value: "comet" } });
    fireEvent.click(screen.getByRole("button", { name: "Add as child" }));

    const flavours = latest();
    const added = flavours.find(flavour => flavour.name === "Stargazing");
    const stateOf = (uuid: string) : string => flavours.find(flavour => flavour.uuid === uuid).state;

    expect(added).toMatchObject({ parentUuid: "comet", state: "YES" });
    expect(added.uuid).toMatch(/^[0-9a-f-]{36}$/);
    expect(stateOf("comet")).toBe("YES");
    expect(stateOf("labels")).toBe("YES");
    expect(stateOf("root")).toBe("YES");
    expect(stateOf("chosen_family")).toBe("NO");
    expect(stateOf("creativity")).toBe("NO");
  });

  it("removes a flavour together with its descendants", () => {
    const { latest } = renderModal();

    fireEvent.change(screen.getByLabelText("Flavour to remove"), { target: { value: "labels" } });
    fireEvent.click(screen.getByRole("button", { name: "Remove flavour and all descendants" }));

    expect(latest().map(flavour => flavour.uuid)).toEqual(["root", "creativity"]);
  });
});
