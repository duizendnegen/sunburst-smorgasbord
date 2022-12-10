import { act, fireEvent, render, screen } from '@testing-library/react';
import RemoveFlavourForm from './RemoveFlavourForm';
import * as d3 from 'd3';
import { I18nextProvider } from 'react-i18next';
import flavours from './../../fixtures/testFlavours.json';
import Flavour from '../../interfaces';
import i18n from '../../i18n.tests';
import userEvent from '@testing-library/user-event';

let hierarchicalFlavours = null;

beforeEach(() => {
  hierarchicalFlavours = d3.stratify<Flavour>()
  .id(d => d.uuid)
  .parentId(d => d.parentUuid)
    (flavours);
});

it('renders the remove flavour form', async () => {
  render(
    <I18nextProvider i18n={i18n}>
      <RemoveFlavourForm
        onRemove={() => {}}
        hierarchicalFlavours={hierarchicalFlavours} />
    </I18nextProvider>);

  expect(screen.getByRole("button")).toHaveTextContent("Remove flavour and all descendants");
});

it('removes the selected flavour when the remove button is clicked', async () => {
  const onRemove = jest.fn();

  render(
    <I18nextProvider i18n={i18n}>
      <RemoveFlavourForm
        onRemove={onRemove}
        hierarchicalFlavours={hierarchicalFlavours} />
    </I18nextProvider>);
  
  let uuid = flavours.find(flavour => flavour.key === 'creativity').uuid;
  fireEvent.change(screen.getByLabelText('Flavour to remove'), {
    target: { value: uuid }
  });

  fireEvent.click(screen.getByRole("button"));

  expect(onRemove).toHaveBeenCalledTimes(1);
  expect(onRemove).toHaveBeenCalledWith(
    uuid
  );
});