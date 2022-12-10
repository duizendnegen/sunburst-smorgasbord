import { fireEvent, render, screen } from '@testing-library/react';
import AddFlavourForm from './AddFlavourForm';
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

it('renders the add flavour form', async () => {
  render(
    <I18nextProvider i18n={i18n}>
      <AddFlavourForm
        onAdd={() => {}}
        hierarchicalFlavours={hierarchicalFlavours} />
    </I18nextProvider>);

  expect(screen.getByRole("button")).toHaveTextContent("Add as child");
});

it('adds a new flavour when the add button is clicked', async () => {
  const onAdd = jest.fn();

  render(
    <I18nextProvider i18n={i18n}>
      <AddFlavourForm
        onAdd={onAdd}
        hierarchicalFlavours={hierarchicalFlavours} />
    </I18nextProvider>);
  
  let parentUuid = flavours.find(flavour => flavour.key === 'creativity').uuid;
  fireEvent.change(screen.getByLabelText('Parent element'), {
    target: { value: parentUuid }
  });

  userEvent.type(screen.getByLabelText("New flavour name"), 'Projects');

  fireEvent.click(screen.getByRole("button"));

  expect(onAdd).toHaveBeenCalledTimes(1);
  expect(onAdd).toHaveBeenCalledWith(
    'Projects',
    parentUuid
  );
});