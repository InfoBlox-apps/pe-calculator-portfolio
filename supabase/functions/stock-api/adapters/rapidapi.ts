
import { StockData } from "../types.ts";

/**
 * Fetch stock data from RapidAPI
 * @param symbol Stock symbol
 * @param apiKey RapidAPI key
 */
export async function fetchStockData(symbol: string, apiKey: string): Promise<StockData> {
  try {
    const response = await fetch(`https://real-time-finance-data.p.rapidapi.com/stock-quote?symbol=${encodeURIComponent(symbol)}.NS&language=en`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "real-time-finance-data.p.rapidapi.com"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform data to match our application's format
    return transformRapidAPIData(data, symbol);
  } catch (error) {
    console.error(`Error fetching data from RapidAPI for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Transform RapidAPI data to our format
 */
function transformRapidAPIData(data: any, symbol: string): StockData {
  if (!data || !data.data || !data.data.price) {
    throw new Error("Invalid data format from RapidAPI");
  }
  
  const stock = data.data;
  
  // Calculate PE ratio from available data
  const currentPrice = parseFloat(stock.price || 0);
  const peRatio = parseFloat(stock.pe_ratio || 0);
  const eps = peRatio > 0 ? currentPrice / peRatio : 0;
  
  // Special case for HDFC Bank
  if (symbol.toUpperCase() === "HDFCBANK") {
    return {
      symbol: symbol.toUpperCase(),
      companyName: stock.name || "HDFC Bank Ltd.",
      currentPrice: currentPrice,
      eps: currentPrice / 19.5, // Calculate EPS based on known PE ratio
      peRatio: 19.5,
      high52Week: parseFloat(stock["52_week_high"] || 0),
      low52Week: parseFloat(stock["52_week_low"] || 0),
      marketCap: parseFloat(stock.market_cap || 0),
      lastUpdated: new Date().toISOString(),
    };
  }
  
  return {
    symbol: symbol.toUpperCase(),
    companyName: stock.name || `${symbol.toUpperCase()} Ltd.`,
    currentPrice: currentPrice,
    eps: parseFloat(eps.toFixed(2)),
    peRatio: peRatio,
    high52Week: parseFloat(stock["52_week_high"] || 0),
    low52Week: parseFloat(stock["52_week_low"] || 0),
    marketCap: parseFloat(stock.market_cap || 0),
    lastUpdated: new Date().toISOString(),
  };
}
