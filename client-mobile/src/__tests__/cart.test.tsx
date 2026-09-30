import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CartProvider, useCart } from '../cart';
import type { Product } from '../types';

jest.mock('@react-native-async-storage/async-storage');

const prod = (over: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: 'Roli',
  slug: 'roli',
  category_id: 'cat-1',
  image: null,
  price: 30,
  unit: '1 pack',
  reference_quantity: '1 pack',
  stock: 100,
  is_active: true,
  emoji: '🔴',
  deal_percent: 0,
  ...over,
});

let api: ReturnType<typeof useCart> | null = null;
function Probe() {
  api = useCart();
  return null;
}

function renderCart() {
  api = null;
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );
  });
  return tree!;
}

describe('cart', () => {
  it('starts empty', () => {
    renderCart();
    expect(api!.items).toEqual([]);
    expect(api!.count).toBe(0);
    expect(api!.subtotal).toBe(0);
  });

  it('setQuantity adds and updates', () => {
    renderCart();
    act(() => api!.setQuantity(prod(), 2));
    expect(api!.getQuantity('prod-1')).toBe(2);
    expect(api!.count).toBe(2);
    expect(api!.subtotal).toBe(60);
    act(() => api!.setQuantity(prod(), 5));
    expect(api!.getQuantity('prod-1')).toBe(5);
  });

  it('setQuantity 0 removes', () => {
    renderCart();
    act(() => api!.setQuantity(prod(), 1));
    act(() => api!.setQuantity(prod(), 0));
    expect(api!.items).toEqual([]);
  });

  it('increase/decrease walk quantities', () => {
    renderCart();
    act(() => api!.setQuantity(prod(), 1));
    act(() => api!.increase('prod-1'));
    expect(api!.getQuantity('prod-1')).toBe(2);
    act(() => api!.decrease('prod-1'));
    act(() => api!.decrease('prod-1'));
    expect(api!.items).toEqual([]);
  });

  it('clear empties the cart', () => {
    renderCart();
    act(() => api!.setQuantity(prod(), 3));
    act(() => api!.clear());
    expect(api!.items).toEqual([]);
    expect(api!.count).toBe(0);
  });
});
