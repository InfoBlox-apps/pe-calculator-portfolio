
import { toast } from "sonner";

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

export interface Portfolio {
  stocks: StockData[];
}

// This is a mock function that simulates fetching stock data from an API
// In a real application, you would replace this with actual API calls
export async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    console.log(`Fetching stock data for ${symbol}...`);
    
    // For demonstration purposes, we'll simulate an API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, you would make an API call to fetch real stock data
    // For example: const response = await fetch(`https://api.example.com/stocks/${symbol}`);
    
    // Check if the symbol is valid (for demo purposes, we consider most symbols valid)
    if (symbol.length < 2) {
      toast.error("Invalid stock symbol");
      return null;
    }
    
    // Generate mock data based on the symbol
    // In a real application, this would come from the API response
    const mockPrice = 100 + Math.random() * 900;
    const mockEPS = 5 + Math.random() * 45;
    const mockPE = mockPrice / mockEPS;
    
    return {
      symbol: symbol.toUpperCase(),
      companyName: generateCompanyName(symbol),
      currentPrice: parseFloat(mockPrice.toFixed(2)),
      eps: parseFloat(mockEPS.toFixed(2)),
      peRatio: parseFloat(mockPE.toFixed(2)),
      high52Week: parseFloat((mockPrice * 1.2).toFixed(2)),
      low52Week: parseFloat((mockPrice * 0.8).toFixed(2)),
      marketCap: parseFloat((mockPrice * 1000000).toFixed(0)),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching stock data:", error);
    toast.error("Failed to fetch stock data");
    return null;
  }
}

// Helper function to generate a company name for demonstration
function generateCompanyName(symbol: string): string {
  const prefixes = ["Tech", "Global", "India", "National", "Bharat", "Future", "Prime"];
  const suffixes = ["Solutions", "Enterprises", "Industries", "Technologies", "Corp", "Limited", "Motors"];
  
  // Use the symbol to deterministically generate a company name
  const prefix = prefixes[symbol.charCodeAt(0) % prefixes.length];
  const suffix = suffixes[symbol.charCodeAt(symbol.length - 1) % suffixes.length];
  
  return `${prefix} ${symbol.toUpperCase()} ${suffix}`;
}

// Function to search for stocks by name or symbol
export async function searchStocks(query: string): Promise<{ symbol: string; name: string }[]> {
  if (!query || query.length < 2) return [];
  
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, you would make an API call to search for stocks
  // For demonstration, we'll return mock results
  const mockStocks = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd." },
    { symbol: "TCS", name: "Tata Consultancy Services Ltd." },
    { symbol: "INFY", name: "Infosys Ltd." },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd." },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd." },
    { symbol: "ITC", name: "ITC Ltd." },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd." },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd." },
    { symbol: "HDFC", name: "Housing Development Finance Corporation Ltd." },
    { symbol: "SBIN", name: "State Bank of India" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd." },
    { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd." },
    { symbol: "ASIANPAINT", name: "Asian Paints Ltd." },
    { symbol: "MARUTI", name: "Maruti Suzuki India Ltd." },
    { symbol: "TITAN", name: "Titan Company Ltd." },
    { symbol: "AXISBANK", name: "Axis Bank Ltd." },
    { symbol: "HCLTECH", name: "HCL Technologies Ltd." },
    { symbol: "WIPRO", name: "Wipro Ltd." },
    { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd." },
    { symbol: "ADANIPORTS", name: "Adani Ports and Special Economic Zone Ltd." },
  ];
  
  // Filter the mock stocks based on the query
  return mockStocks.filter(
    stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
      stock.name.toLowerCase().includes(query.toLowerCase())
  );
}

// Function to save the portfolio to localStorage
export function savePortfolio(portfolio: Portfolio): void {
  try {
    localStorage.setItem('stock-portfolio', JSON.stringify(portfolio));
    console.log('Portfolio saved successfully');
  } catch (error) {
    console.error('Error saving portfolio:', error);
    toast.error('Failed to save portfolio');
  }
}

// Function to load the portfolio from localStorage
export function loadPortfolio(): Portfolio {
  try {
    const data = localStorage.getItem('stock-portfolio');
    if (data) {
      return JSON.parse(data) as Portfolio;
    }
  } catch (error) {
    console.error('Error loading portfolio:', error);
    toast.error('Failed to load portfolio');
  }
  
  // Return an empty portfolio if nothing is found or there's an error
  return { stocks: [] };
}
