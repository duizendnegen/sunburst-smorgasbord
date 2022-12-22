import { I18nextProvider } from "react-i18next";
import ResetConfirmationModal from "./ResetConfirmationModal";
import i18n from "../../i18n.tests";
import { fireEvent, render, screen } from "@testing-library/react";

it("does not reset after cancelling", async () => {
  const onReset = jest.fn();
  const onCancel = jest.fn();

  render(
    <I18nextProvider i18n={i18n}>
      <ResetConfirmationModal
        isActive={true}
        onCancel={onCancel}
        onReset={onReset} />
    </I18nextProvider>);

  fireEvent.click(screen.getByText("No, cancel"));

  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onReset).toHaveBeenCalledTimes(0);
});

it("resets after confirming", async () => {
  const onReset = jest.fn();
  const onCancel = jest.fn();

  render(
    <I18nextProvider i18n={i18n}>
      <ResetConfirmationModal
        isActive={true}
        onCancel={onCancel}
        onReset={onReset} />
    </I18nextProvider>);

  fireEvent.click(screen.getByText("Yes, reset"));

  expect(onCancel).toHaveBeenCalledTimes(0);
  expect(onReset).toHaveBeenCalledTimes(1);
});