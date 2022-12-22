import { I18nextProvider } from "react-i18next";
import ResetButton from "./ResetButton";
import i18n from "../../i18n.tests";
import { fireEvent, render, screen } from "@testing-library/react";

it("resets the flavours", async () => {
  const onClick = jest.fn();
  render(
    <I18nextProvider i18n={i18n}>
      <ResetButton
        onClick={onClick} />
    </I18nextProvider>);

  fireEvent.click(screen.getByText("Reset"));
  
  expect(onClick).toHaveBeenCalledTimes(1);
});