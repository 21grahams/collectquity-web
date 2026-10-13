import type { CatalogProduct } from '../api/types';

import { ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { theme } from '../theme/theme';
import { AutocompleteInput } from './AutocompleteInput';

const charmander: CatalogProduct = {
  tcgplayerId: '662143',
  kind: 'single',
  name: 'Charmander',
  number: '011/094',
  setName: 'Phantasmal Flames',
  productName: 'Charmander',
  printings: ['Normal', 'Reverse Holofoil'],
  imageUrl: null,
};
const catalog = vi.hoisted(() => ({ results: [] as CatalogProduct[], searching: false }));
vi.mock('../hooks/queries', () => ({
  useCatalogSearch: () => ({ products: catalog.results, searching: catalog.searching }),
}));

function Harness({ onPickProduct }: { onPickProduct: (p: CatalogProduct) => void }) {
  const [value, setValue] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <AutocompleteInput
        aria-label="Pokémon"
        value={value}
        onChange={setValue}
        options={['Charizard', 'Charmander']}
        catalog="single"
        onPickProduct={onPickProduct}
      />
    </ThemeProvider>
  );
}

describe('AutocompleteInput', () => {
  it('shows catalog matches instead of saved names, and picking one hands over the product', () => {
    catalog.results = [charmander];
    const onPickProduct = vi.fn();
    render(<Harness onPickProduct={onPickProduct} />);
    const input = screen.getByLabelText('Pokémon');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'charm' } });

    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.click(screen.getByText('011/094 · Phantasmal Flames'));
    expect(onPickProduct).toHaveBeenCalledWith(charmander);
  });

  it('shows no saved names while the catalog is still searching', () => {
    catalog.results = [];
    catalog.searching = true;
    render(<Harness onPickProduct={vi.fn()} />);
    const input = screen.getByLabelText('Pokémon');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'char' } });

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('falls back to saved names when the catalog has nothing', () => {
    catalog.results = [];
    catalog.searching = false;
    render(<Harness onPickProduct={vi.fn()} />);
    const input = screen.getByLabelText('Pokémon');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'char' } });

    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Charizard', 'Charmander']);
  });

  it('the ✕ clears the field', () => {
    catalog.results = [];
    render(<Harness onPickProduct={vi.fn()} />);
    const input = screen.getByLabelText('Pokémon');
    expect(screen.queryByLabelText('Clear')).toBeNull();
    fireEvent.change(input, { target: { value: 'Charizard' } });
    fireEvent.click(screen.getByLabelText('Clear'));

    expect(input).toHaveValue('');
    expect(screen.queryByLabelText('Clear')).toBeNull();
  });
});
