import {
  colors,
  GRADIENT_HEADER,
  CATEGORY_PALETTE,
  colorForIndex,
  categoryColorIndex,
  statusColors,
  INR,
  formatDate,
  formatDateTime,
} from '../theme';

describe('colors', () => {
  it('has the expected palette', () => {
    expect(colors.maroon).toBe('#6B1D1D');
    expect(colors.gold).toBe('#D4AF37');
    expect(colors.cream).toBe('#FAF5EF');
    expect(colors.paper).toBe('#FFFFFF');
    expect(colors.ruby).toBe('#E11D48');
  });
  it('is readonly-ish (values are strings)', () => {
    expect(typeof colors.maroon).toBe('string');
  });
});

describe('GRADIENT_HEADER', () => {
  it('starts with maroon', () => {
    expect(GRADIENT_HEADER[0]).toBe('#6B1D1D');
    expect(GRADIENT_HEADER[1]).toBe('#4A1010');
  });
});

describe('CATEGORY_PALETTE', () => {
  it('has 8 colors', () => {
    expect(CATEGORY_PALETTE.length).toBe(8);
  });
});

describe('colorForIndex', () => {
  it('returns palette color in range', () => {
    for (let i = 0; i < 20; i++) {
      const c = colorForIndex(i);
      expect(CATEGORY_PALETTE).toContain(c);
    }
  });
  it('wraps around', () => {
    expect(colorForIndex(8)).toBe(colorForIndex(0));
    expect(colorForIndex(16)).toBe(colorForIndex(0));
  });
});

describe('categoryColorIndex', () => {
  const cats = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  it('returns matching index', () => {
    expect(categoryColorIndex('b', cats)).toBe(1);
    expect(categoryColorIndex('a', cats)).toBe(0);
  });
  it('returns last palette index for unknown', () => {
    expect(categoryColorIndex('unknown', cats)).toBe(CATEGORY_PALETTE.length - 1);
  });
});

describe('statusColors', () => {
  it('maps all order statuses', () => {
    expect(statusColors.Pending).toBeDefined();
    expect(statusColors.Confirmed).toBeDefined();
    expect(statusColors.Shipped).toBeDefined();
    expect(statusColors.Delivered).toBeDefined();
    expect(statusColors.Failed).toBeDefined();
  });
});

describe('INR', () => {
  it('formats with rupee and commas', () => {
    expect(INR(123456)).toBe('₹1,23,456');
    expect(INR(0)).toBe('₹0');
  });
});

describe('formatDate', () => {
  it('returns a readable date string', () => {
    const s = formatDate('2025-06-15T00:00:00Z');
    expect(s).toContain('Jun');
    expect(s).toContain('2025');
  });
  it('returns iso for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatDateTime', () => {
  it('includes hour and minute in locale format', () => {
    const s = formatDateTime('2025-06-15T14:30:00Z');
    expect(s).toContain('Jun');
    expect(s).toMatch(/:\d{2}/);
  });
});
