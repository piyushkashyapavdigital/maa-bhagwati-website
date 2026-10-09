import { DELIVERY_CHARGE, FREE_DELIVERY_RADIUS_KM, RAZORPAY_KEY_ID, SITE_URL } from '../config';

describe('config', () => {
  it('points at production', () => {
    expect(SITE_URL).toBe('https://maa-bhagwati.vercel.app');
  });
  it('uses Razorpay TEST key in development', () => {
    expect(RAZORPAY_KEY_ID).toMatch(/^rzp_test_/);
  });
  it('matches server delivery rule', () => {
    expect(DELIVERY_CHARGE).toBe(70);
    expect(FREE_DELIVERY_RADIUS_KM).toBe(2);
  });
});
