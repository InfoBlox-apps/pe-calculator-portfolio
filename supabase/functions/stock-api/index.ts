
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const NSETOOLS_API_BASE = "https://api.nsetools.in/nse-data";
const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");
const TWELVE_DATA_API_KEY = Deno.env.get("TWELVE_DATA_API_KEY");

// Cache implementation
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { symbol, action } = await req.json();

    // Validate request
    if (!symbol && action !== "list") {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Handle different actions
    if (action === "list") {
      const stocksList = await fetchStocksList();
      return new Response(
        JSON.stringify(stocksList),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    } else if (action === "quote") {
      // Check cache first
      const cacheKey = `quote_${symbol}`;
      if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
        console.log(`Using cached data for ${symbol}`);
        return new Response(
          JSON.stringify(cache[cacheKey].data),
          { 
            headers: { 
              ...corsHeaders,
              "Content-Type": "application/json" 
            } 
          }
        );
      }

      // Fetch data based on available API keys
      let stockData;
      if (RAPID_API_KEY) {
        stockData = await fetchStockDataFromRapidAPI(symbol);
      } else if (TWELVE_DATA_API_KEY) {
        stockData = await fetchStockDataFromTwelveData(symbol);
      } else {
        // Fallback to NSETools API which doesn't require a key
        stockData = await fetchStockDataFromNSETools(symbol);
      }

      // Store in cache
      cache[cacheKey] = {
        data: stockData,
        timestamp: Date.now()
      };

      return new Response(
        JSON.stringify(stockData),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});

// Helper function to fetch the list of NSE stocks
async function fetchStocksList() {
  try {
    const response = await fetch(`${NSETOOLS_API_BASE}/list`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stocks list: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching stocks list:", error);
    
    // Fallback to a hardcoded common NSE stocks list
    return {
      symbols: [
        { symbol: "RELIANCE", name: "Reliance Industries Ltd." },
        { symbol: "TCS", name: "Tata Consultancy Services Ltd." },
        { symbol: "HDFCBANK", name: "HDFC Bank Ltd." },
        { symbol: "INFY", name: "Infosys Ltd." },
        { symbol: "ICICIBANK", name: "ICICI Bank Ltd." },
        { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd." },
        { symbol: "ITC", name: "ITC Ltd." },
        { symbol: "SBIN", name: "State Bank of India" },
        { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd." },
        { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd." },
        // ... add at least 40 more common NSE stocks
      ]
    };
  }
}

// NSETools API - doesn't require API key but may have limitations
async function fetchStockDataFromNSETools(symbol) {
  try {
    const response = await fetch(`${NSETOOLS_API_BASE}/quote?symbol=${encodeURIComponent(symbol)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform data to match our application's format
    return transformNSEToolsData(data, symbol);
  } catch (error) {
    console.error(`Error fetching data from NSETools for ${symbol}:`, error);
    throw error;
  }
}

// RapidAPI - requires API key from https://rapidapi.com/
async function fetchStockDataFromRapidAPI(symbol) {
  try {
    const response = await fetch(`https://real-time-finance-data.p.rapidapi.com/stock-quote?symbol=${encodeURIComponent(symbol)}.NS&language=en`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPID_API_KEY,
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

// TwelveData API - requires API key from https://twelvedata.com/
async function fetchStockDataFromTwelveData(symbol) {
  try {
    // Get price data
    const priceResponse = await fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}.NS&apikey=${TWELVE_DATA_API_KEY}`);
    if (!priceResponse.ok) {
      throw new Error(`Failed to fetch price data: ${priceResponse.status}`);
    }
    
    const priceData = await priceResponse.json();
    
    // Get company details
    const infoResponse = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}.NS&apikey=${TWELVE_DATA_API_KEY}`);
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

// Transform NSETools data to our format
function transformNSEToolsData(data, symbol) {
  if (!data || !data.data) {
    throw new Error("Invalid data format from NSETools API");
  }
  
  const stock = data.data;
  
  // Calculate PE ratio from available data
  const currentPrice = parseFloat(stock.lastPrice || stock.closePrice || 0);
  const eps = parseFloat(stock.eps || 0);
  const peRatio = eps > 0 ? currentPrice / eps : 0;
  
  return {
    symbol: symbol.toUpperCase(),
    companyName: stock.companyName || `${symbol.toUpperCase()} Ltd.`,
    currentPrice: currentPrice,
    eps: eps,
    peRatio: parseFloat(peRatio.toFixed(2)),
    high52Week: parseFloat(stock.high52 || 0),
    low52Week: parseFloat(stock.low52 || 0),
    marketCap: parseFloat(stock.marketCap || 0),
    lastUpdated: new Date().toISOString(),
  };
}

// Transform RapidAPI data to our format
function transformRapidAPIData(data, symbol) {
  if (!data || !data.data || !data.data.price) {
    throw new Error("Invalid data format from RapidAPI");
  }
  
  const stock = data.data;
  
  // Calculate PE ratio from available data
  const currentPrice = parseFloat(stock.price || 0);
  const peRatio = parseFloat(stock.pe_ratio || 0);
  const eps = peRatio > 0 ? currentPrice / peRatio : 0;
  
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

// Transform TwelveData API data to our format
function transformTwelveDataAPI(priceData, infoData, symbol) {
  if (!priceData || !priceData.price || !infoData) {
    throw new Error("Invalid data format from TwelveData API");
  }
  
  const currentPrice = parseFloat(priceData.price);
  const peRatio = parseFloat(infoData.pe_ratio || 0);
  const eps = peRatio > 0 ? currentPrice / peRatio : 0;
  
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
