
import { useState, useEffect, useCallback } from 'react';
import { 
  StockData, 
  Portfolio, 
  savePortfolio, 
  loadPortfolio, 
  fetchStockData,
  isPortfolioDataStale 
} from '@/services/stockService';
import { toast } from "sonner";

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio>({ stocks: [] });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load the portfolio from localStorage on initial render
  useEffect(() => {
    const savedPortfolio = loadPortfolio();
    if (savedPortfolio && savedPortfolio.stocks) {
      setPortfolio(savedPortfolio);
      
      // Check if data is stale and needs refreshing
      if (isPortfolioDataStale(savedPortfolio)) {
        console.log("Portfolio data is stale, refreshing...");
        refreshPortfolioData(savedPortfolio);
      }
    }
  }, []);

  // Refresh stale portfolio data
  const refreshPortfolioData = async (portfolioToRefresh: Portfolio) => {
    if (!portfolioToRefresh?.stocks?.length) return;
    
    setRefreshing(true);
    try {
      const updatedStocks = await Promise.all(
        (portfolioToRefresh.stocks || []).map(async (stock) => {
          const updated = await fetchStockData(stock.symbol);
          return updated || stock;
        })
      );
      
      const updatedPortfolio = {
        ...portfolioToRefresh,
        stocks: updatedStocks
      };
      
      setPortfolio(updatedPortfolio);
      savePortfolio(updatedPortfolio);
      
      toast.success('Portfolio data refreshed');
    } catch (error) {
      console.error('Error refreshing portfolio data:', error);
      toast.error('Failed to refresh portfolio data');
    } finally {
      setRefreshing(false);
    }
  };

  // Save the portfolio to localStorage whenever it changes
  useEffect(() => {
    if (portfolio?.stocks?.length > 0) {
      savePortfolio(portfolio);
    }
  }, [portfolio]);

  // Add a stock to the portfolio
  const addStock = useCallback(async (symbol: string) => {
    // Check if the stock is already in the portfolio
    if (portfolio?.stocks?.some(stock => stock.symbol === symbol.toUpperCase())) {
      toast.info(`${symbol.toUpperCase()} is already in your portfolio`);
      return false;
    }

    setLoading(true);
    try {
      const stockData = await fetchStockData(symbol);
      if (stockData) {
        setPortfolio(prev => ({
          ...prev,
          stocks: [...(prev?.stocks || []), stockData]
        }));
        toast.success(`Added ${stockData.symbol} to portfolio`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock');
      return false;
    } finally {
      setLoading(false);
    }
  }, [portfolio]);

  // Remove a stock from the portfolio
  const removeStock = useCallback((symbol: string) => {
    setPortfolio(prev => ({
      ...prev,
      stocks: prev?.stocks?.filter(stock => stock.symbol !== symbol) || []
    }));
    toast.success(`Removed ${symbol} from portfolio`);
  }, []);

  // Refresh all stocks in the portfolio
  const refreshPortfolio = useCallback(async () => {
    if (!portfolio?.stocks?.length) return;
    
    setRefreshing(true);
    try {
      const updatedStocks = await Promise.all(
        (portfolio.stocks || []).map(async (stock) => {
          const updated = await fetchStockData(stock.symbol);
          return updated || stock;
        })
      );
      
      setPortfolio(prev => ({
        ...prev,
        stocks: updatedStocks
      }));
      
      toast.success('Portfolio refreshed');
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
      toast.error('Failed to refresh portfolio');
    } finally {
      setRefreshing(false);
    }
  }, [portfolio]);

  // Calculate portfolio statistics
  const getPortfolioStats = useCallback(() => {
    if (!portfolio?.stocks?.length) {
      return {
        averagePE: 0,
        highestPE: { symbol: '', value: 0 },
        lowestPE: { symbol: '', value: 0 },
        totalStocks: 0
      };
    }

    const totalStocks = portfolio.stocks.length;
    let totalPE = 0;
    let highestPE = { symbol: '', value: -Infinity };
    let lowestPE = { symbol: '', value: Infinity };

    portfolio.stocks.forEach(stock => {
      totalPE += stock.peRatio;

      if (stock.peRatio > highestPE.value) {
        highestPE = { symbol: stock.symbol, value: stock.peRatio };
      }

      if (stock.peRatio < lowestPE.value) {
        lowestPE = { symbol: stock.symbol, value: stock.peRatio };
      }
    });

    return {
      averagePE: totalPE / totalStocks,
      highestPE,
      lowestPE,
      totalStocks
    };
  }, [portfolio]);

  return {
    portfolio,
    loading,
    refreshing,
    addStock,
    removeStock,
    refreshPortfolio,
    getPortfolioStats
  };
}
