
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStockData, searchStocks } from './stockService';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock toast for tests
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe('Stock Service', () => {
  const mockStockData = {
    symbol: 'NESTLEIND',
    companyName: 'Nestle India Ltd.',
    currentPrice: 2380.55,
    eps: 115.37,
    peRatio: 20.63,
    high52Week: 2778.00,
    low52Week: 2110.00,
    marketCap: 229739000000,
    lastUpdated: new Date().toISOString()
  };
  
  const mockStocksList = {
    symbols: [
      { symbol: 'NESTLEIND', name: 'Nestle India Ltd.' },
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchStockData', () => {
    it('should fetch stock data from Supabase Edge Function', async () => {
      // Mock successful response
      (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: mockStockData,
        error: null
      });

      const result = await fetchStockData('NESTLEIND');
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith('stock-api', {
        body: {
          symbol: 'NESTLEIND',
          action: 'quote'
        }
      });
      
      expect(result).toEqual(mockStockData);
    });

    it('should handle HDFCBANK special case', async () => {
      // Mock successful response
      (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: { ...mockStockData, symbol: 'HDFCBANK', peRatio: 15 },
        error: null
      });

      const result = await fetchStockData('HDFCBANK');
      
      // Should override with the hardcoded PE ratio
      expect(result?.peRatio).toBe(19.5);
    });

    it('should return cached data if available', async () => {
      // First call to cache the data
      (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: mockStockData,
        error: null
      });
      
      await fetchStockData('NESTLEIND');
      
      // Reset the mock for the second call
      vi.clearAllMocks();
      
      // Second call should use cache
      const result = await fetchStockData('NESTLEIND');
      
      // Should not call the API again
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
      expect(result).toEqual(mockStockData);
    });

    it('should handle API errors and return fallback data', async () => {
      // Mock error response
      (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'API error' }
      });

      const result = await fetchStockData('NESTLEIND');
      
      // Should return fallback data
      expect(result).not.toBeNull();
      expect(result?.symbol).toBe('NESTLEIND');
    });
  });

  describe('searchStocks', () => {
    it('should search for stocks using the edge function', async () => {
      // Mock successful response
      (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: mockStocksList,
        error: null
      });

      const result = await searchStocks('NESTLE');
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith('stock-api', {
        body: {
          action: 'list'
        }
      });
      
      expect(result).toEqual([{ symbol: 'NESTLEIND', name: 'Nestle India Ltd.' }]);
    });

    it('should return empty array for short queries', async () => {
      const result = await searchStocks('N');
      
      // Should not call API for short queries
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle API errors and use fallback data', async () => {
      // Mock error response
      (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'API error' }
      });

      const result = await searchStocks('NESTLE');
      
      // Should use fallback data
      expect(result.length).toBeGreaterThan(0);
      // The fallback data includes NSE stocks
      expect(result.some(stock => stock.symbol === 'NESTLEIND')).toBe(true);
    });
  });
});
