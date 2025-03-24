
// Common types used across the API

export interface StockData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  eps: number;
  peRatio: number;
  high52Week: number;
  low52Week: number;
  marketCap: number;
  lastUpdated: string;
}

export interface StockSymbol {
  symbol: string;
  name: string;
}

export interface StockListResponse {
  symbols: StockSymbol[];
}
