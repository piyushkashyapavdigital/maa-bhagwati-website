import { ORDER_STATUSES, type OrderStatus } from '../types';

describe('ORDER_STATUSES', () => {
  it('contains all five statuses', () => {
    expect(ORDER_STATUSES).toEqual([
      'Pending',
      'Confirmed',
      'Shipped',
      'Delivered',
      'Failed',
    ]);
  });
  it('has exactly 5 entries', () => {
    expect(ORDER_STATUSES.length).toBe(5);
  });
  it('contains no duplicates', () => {
    expect(new Set(ORDER_STATUSES).size).toBe(5);
  });
});

describe('OrderStatus type', () => {
  it('accepts all status literals', () => {
    const s: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Failed'];
    expect(s.length).toBe(5);
  });
});
