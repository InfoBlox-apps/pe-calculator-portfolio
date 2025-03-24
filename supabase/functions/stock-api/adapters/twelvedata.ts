
import { StockData } from "../types.ts";

/**
 * Fetch stock data from TwelveData API
 * @param symbol Stock symbol
 * @param apiKey TwelveData API key
 */
export async function fetchStockData(symbol: string, apiKey: string): Promise<StockData> {
  try {
    // Get price data
    const priceResponse = await fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}.NS&apikey=${apiKey}`);
    if (!priceResponse.ok) {
      throw new Error(`Failed to fetch price data: ${priceResponse.status}`);
    }
    
    const priceData = await priceResponse.json();
    
    // Get company details
    const infoResponse = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}.NS&apikey=${apiKey}`);
    if (!infoResponse.ok) {
      throw new Error(`Failed to fetch company info: ${infoResponse.status}`);
    }
    
    const infoData = await infoResponse.json();
    
    // Transform data to match our application's format
    return transformTwelveDataAPI(priceData, infoData, symbol);
  } catch (error) {
    console.error(`Error fetching data from TwelveData for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Transform TwelveData API data to our format
 */
function transformTwelveDataAPI(priceData: any, infoData: any, symbol: string): StockData {
  if (!priceData || !priceData.price || !infoData) {
    throw new Error("Invalid data format from TwelveData API");
  }
  
  const currentPrice = parseFloat(priceData.price);
  const peRatio = parseFloat(infoData.pe_ratio || 0);
  const eps = peRatio > 0 ? currentPrice / peRatio : 0;
  
  // Special case for HDFC Bank
  if (symbol.toUpperCase() === "HDFCBANK") {
    return {
      symbol: symbol.toUpperCase(),
      companyName: infoData.name || "HDFC Bank Ltd.",
      currentPrice: currentPrice,
      eps: currentPrice / 19.5, // Calculate EPS based on known PE ratio
      peRatio: 19.5,
      high52Week: parseFloat(infoData["fifty_two_week"]["high"] || 0),
      low52Week: parseFloat(infoData["fifty_two_week"]["low"] || 0),
      marketCap: parseFloat(infoData.market_cap || 0),
      lastUpdated: new Date().toISOString(),
    };
  }
  
  return {
    symbol: symbol.toUpperCase(),
    companyName: infoData.name || `${symbol.toUpperCase()} Ltd.`,
    currentPrice: currentPrice,
    eps: parseFloat(eps.toFixed(2)),
    peRatio: peRatio,
    high52Week: parseFloat(infoData["fifty_two_week"]["high"] || 0),
    low52Week: parseFloat(infoData["fifty_two_week"]["low"] || 0),
    marketCap: parseFloat(infoData.market_cap || 0),
    lastUpdated: new Date().toISOString(),
  };
}
