import { 
  formatPhoneNumber, 
  isValidPhoneNumber, 
  getRiskColor, 
  calculateTotalOutstanding,
  parseCurrency
} from '../helpers';

describe('Utility Helpers', () => {
  describe('formatPhoneNumber', () => {
    it('formats 10 digit number correctly', () => {
      expect(formatPhoneNumber('9876543210')).toBe('98765 43210');
    });

    it('formats 12 digit number correctly', () => {
      expect(formatPhoneNumber('919876543210')).toBe('+91 98765 43210');
    });

    it('returns original if length is neither 10 nor 12', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('returns true for 10 digits', () => {
      expect(isValidPhoneNumber('9876543210')).toBe(true);
    });

    it('returns true for 12 digits', () => {
      expect(isValidPhoneNumber('919876543210')).toBe(true);
    });

    it('returns false for 5 digits', () => {
      expect(isValidPhoneNumber('12345')).toBe(false);
    });
  });

  describe('getRiskColor', () => {
    it('returns red for high risk', () => {
      expect(getRiskColor('high')).toBe('#DC2626');
    });

    it('returns green for low risk', () => {
      expect(getRiskColor('low')).toBe('#10B981');
    });
  });

  describe('calculateTotalOutstanding', () => {
    it('sums positive balances correctly', () => {
      const mockCustomers = [
        { balance: 100 } as any,
        { balance: 200 } as any,
        { balance: -50 } as any, // Should ignore negative balance
      ];
      expect(calculateTotalOutstanding(mockCustomers)).toBe(300);
    });

    it('returns 0 for empty list', () => {
      expect(calculateTotalOutstanding([])).toBe(0);
    });
  });

  describe('parseCurrency', () => {
    it('parses formatted currency string to number', () => {
      expect(parseCurrency('Rs 1,234.56')).toBe(1234.56);
      expect(parseCurrency('100')).toBe(100);
    });
  });
});
