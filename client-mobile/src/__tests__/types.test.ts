import { estimateTotals, validateAddress, type AddressForm } from '../types';
import { dealOf, dealTagOf, mrpOf } from '../types';

const valid: AddressForm = {
  name: 'Ramkumar Sharma',
  phone: '9876543210',
  email: '',
  address1: 'House 45, Ram Nagar',
  address2: '',
  city: 'Lucknow',
  state: 'Uttar Pradesh',
  pincode: '226001',
  landmark: '',
  notes: '',
};

describe('validateAddress', () => {
  it('accepts a valid form', () => {
    expect(validateAddress(valid)).toEqual({});
  });
  it('requires name, address, city, state', () => {
    const e = validateAddress({ ...valid, name: '', address1: '', city: '', state: '' });
    expect(e.name).toBeTruthy();
    expect(e.address1).toBeTruthy();
    expect(e.city).toBeTruthy();
    expect(e.state).toBeTruthy();
  });
  it('rejects bad phone numbers', () => {
    expect(validateAddress({ ...valid, phone: '123' }).phone).toBeTruthy();
    expect(validateAddress({ ...valid, phone: '5876543210' }).phone).toBeTruthy();
    expect(validateAddress({ ...valid, phone: '9876543210' }).phone).toBeFalsy();
  });
  it('rejects bad pincodes', () => {
    expect(validateAddress({ ...valid, pincode: '12345' }).pincode).toBeTruthy();
    expect(validateAddress({ ...valid, pincode: 'abcdef' }).pincode).toBeTruthy();
    expect(validateAddress({ ...valid, pincode: '226001' }).pincode).toBeFalsy();
  });
});

describe('estimateTotals', () => {  it('adds delivery below the free threshold', () => {
    const t = estimateTotals([{ priceSnapshot: 100, quantity: 2 }], 70, 500);
    expect(t).toEqual({ count: 2, subtotal: 200, delivery: 70, total: 270 });
  });
  it('gives free delivery at/above threshold', () => {
    const t = estimateTotals([{ priceSnapshot: 250, quantity: 2 }], 70, 500);
    expect(t.delivery).toBe(0);
    expect(t.total).toBe(500);
  });
  it('is zero for an empty cart', () => {
    expect(estimateTotals([], 70, 500)).toEqual({
      count: 0,
      subtotal: 0,
      delivery: 0,
      total: 0,
    });
  });
});

describe('deals', () => {
  const p = (deal_percent: number) => ({
    id: 'prod-1', name: 'X', slug: 'x', category_id: 'cat-1', image: null,
    price: 80, unit: '1 pc', reference_quantity: '1 pc', stock: 10,
    is_active: true, emoji: '', deal_percent,
  });
  it('dealOf clamps to 0–90', () => {
    expect(dealOf(p(20) as never)).toBe(20);
    expect(dealOf(p(0) as never)).toBe(0);
    expect(dealOf(p(-5) as never)).toBe(0);
    expect(dealOf(p(99) as never)).toBe(90);
  });
  it('mrpOf derives strikethrough price', () => {
    expect(mrpOf(p(20) as never)).toBe(100);
    expect(mrpOf(p(0) as never)).toBe(80);
  });
  it('dealTagOf formats the badge', () => {
    expect(dealTagOf(p(25) as never)).toBe('25% OFF');
    expect(dealTagOf(p(0) as never)).toBe('');
  });
});
