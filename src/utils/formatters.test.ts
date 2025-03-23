
import { 
  formatCurrency, 
  formatLargeNumber, 
  formatPercentage, 
  classifyPE, 
  getPEColorClass 
} from './formatters';

describe('Formatter Utils', () => {
  describe('formatCurrency', () => {
    it('formats currency values correctly', () => {
      expect(formatCurrency(1234.56)).toBe('₹1,234.56');
      expect(formatCurrency(0)).toBe('₹0.00');
      expect(formatCurrency(1000000)).toBe('₹10,00,000.00');
    });
  });

  describe('formatLargeNumber', () => {
    it('formats numbers with appropriate suffixes', () => {
      expect(formatLargeNumber(1234)).toBe('₹1234.00');
      expect(formatLargeNumber(12345)).toBe('₹12.35K');
      expect(formatLargeNumber(1234567)).toBe('₹1.23M');
      expect(formatLargeNumber(1234567890)).toBe('₹1.23B');
      expect(formatLargeNumber(1234567890000)).toBe('₹1.23T');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage values correctly', () => {
      expect(formatPercentage(12.345)).toBe('12.35%');
      expect(formatPercentage(0)).toBe('0.00%');
      expect(formatPercentage(100)).toBe('100.00%');
    });
  });

  describe('classifyPE', () => {
    it('classifies PE ratios correctly', () => {
      expect(classifyPE(10)).toBe('low');
      expect(classifyPE(20)).toBe('medium');
      expect(classifyPE(30)).toBe('high');
      expect(classifyPE(15)).toBe('medium');
      expect(classifyPE(14.99)).toBe('low');
      expect(classifyPE(25.01)).toBe('high');
    });
  });

  describe('getPEColorClass', () => {
    it('returns the correct color class based on PE ratio', () => {
      expect(getPEColorClass(10)).toBe('text-positive');
      expect(getPEColorClass(20)).toBe('text-neutral');
      expect(getPEColorClass(30)).toBe('text-negative');
    });
  });
});
