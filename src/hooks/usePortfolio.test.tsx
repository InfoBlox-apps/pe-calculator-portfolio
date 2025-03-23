
import { renderHook, act, waitFor } from '@/utils/test-utils';
import { usePortfolio } from './usePortfolio';
import { fetchStockData, savePortfolio, loadPortfolio } from '@/services/stockService';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the stock service functions
vi.mock('@/services/stockService', () => ({
  fetchStockData: vi.fn(),
  savePortfolio: vi.fn(),
  loadPortfolio: vi.fn().mockReturnValue({ stocks: [] }),
}));

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('usePortfolio', () => {
  const mockStock = {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd.',
    currentPrice: 2500.75,
    eps: 100.25,
    peRatio: 24.94,
    high52Week: 2800.00,
    low52Week: 2200.00,
    marketCap: 1680000000000,
    lastUpdated: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetchStockData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockStock);
    (loadPortfolio as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ stocks: [] });
  });

  it('should initialize with an empty portfolio', () => {
    const { result } = renderHook(() => usePortfolio());
    
    expect(result.current.portfolio.stocks).toEqual([]);
    expect(loadPortfolio).toHaveBeenCalled();
  });

  it('should add a stock to the portfolio', async () => {
    const { result } = renderHook(() => usePortfolio());
    
    await act(async () => {
      const success = await result.current.addStock('RELIANCE');
      expect(success).toBe(true);
    });
    
    expect(fetchStockData).toHaveBeenCalledWith('RELIANCE');
    expect(result.current.portfolio.stocks).toContainEqual(mockStock);
    expect(savePortfolio).toHaveBeenCalled();
  });

  it('should not add a duplicate stock to the portfolio', async () => {
    const { result } = renderHook(() => usePortfolio());
    
    // Add a stock first
    await act(async () => {
      await result.current.addStock('RELIANCE');
    });
    
    // Try to add the same stock again
    await act(async () => {
      const success = await result.current.addStock('RELIANCE');
      expect(success).toBe(false);
    });
    
    // Verify portfolio still has only one instance of the stock
    expect(result.current.portfolio.stocks.length).toBe(1);
  });

  it('should remove a stock from the portfolio', async () => {
    const { result } = renderHook(() => usePortfolio());
    
    // Add a stock first
    await act(async () => {
      await result.current.addStock('RELIANCE');
    });
    
    // Remove the stock
    act(() => {
      result.current.removeStock('RELIANCE');
    });
    
    // Verify the stock was removed
    expect(result.current.portfolio.stocks.length).toBe(0);
  });

  it('should calculate portfolio statistics correctly', async () => {
    const { result } = renderHook(() => usePortfolio());
    
    await act(async () => {
      await result.current.addStock('RELIANCE');
    });
    
    // Test with one stock
    let stats = result.current.getPortfolioStats();
    expect(stats.averagePE).toBe(24.94);
    expect(stats.highestPE).toEqual({ symbol: 'RELIANCE', value: 24.94 });
    expect(stats.lowestPE).toEqual({ symbol: 'RELIANCE', value: 24.94 });
    expect(stats.totalStocks).toBe(1);
    
    // Add another stock with different PE
    const secondStock = {
      ...mockStock,
      symbol: 'TCS',
      peRatio: 10.5,
    };
    
    (fetchStockData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(secondStock);
    
    await act(async () => {
      await result.current.addStock('TCS');
    });
    
    // Test with two stocks
    stats = result.current.getPortfolioStats();
    expect(stats.averagePE).toBeCloseTo(17.72, 2);
    expect(stats.highestPE).toEqual({ symbol: 'RELIANCE', value: 24.94 });
    expect(stats.lowestPE).toEqual({ symbol: 'TCS', value: 10.5 });
    expect(stats.totalStocks).toBe(2);
  });
});
