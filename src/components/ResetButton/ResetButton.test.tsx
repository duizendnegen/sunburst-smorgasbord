import { I18nextProvider } from "react-i18next";
import ResetButton from "./ResetButton";
import i18n from '../../i18n.tests';
import { act, fireEvent, getByText, render, screen } from '@testing-library/react';

it('resets the flavours after a confirmation', async () => {
  const onReset = jest.fn();
  render(
    <I18nextProvider i18n={i18n}>
      <ResetButton
        onReset={onReset} />
    </I18nextProvider>);

  fireEvent.click(screen.getByText("Reset"));
  fireEvent.click(screen.getByText("No, cancel"));

  expect(onReset).toHaveBeenCalledTimes(0);

  fireEvent.click(screen.getByText("Reset"));
  fireEvent.click(screen.getByText("Yes, reset"));

  expect(onReset).toHaveBeenCalledTimes(1);
});