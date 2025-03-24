
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchStocksList, fetchStockData as fetchNSEToolsStockData } from "./adapters/nsetools.ts";
import { fetchStockData as fetchRapidAPIStockData } from "./adapters/rapidapi.ts";
import { fetchStockData as fetchTwelveDataStockData } from "./adapters/twelvedata.ts";
import { getCachedItem, setCachedItem } from "./cache.ts";
import { StockData } from "./types.ts";

// API Keys
const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");
const TWELVE_DATA_API_KEY = Deno.env.get("TWELVE_DATA_API_KEY");

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
      const cachedData = getCachedItem<StockData>(cacheKey);
      
      if (cachedData) {
        return new Response(
          JSON.stringify(cachedData),
          { 
            headers: { 
              ...corsHeaders,
              "Content-Type": "application/json" 
            } 
          }
        );
      }

      // Fetch data based on available API keys
      let stockData: StockData;
      try {
        if (RAPID_API_KEY) {
          stockData = await fetchRapidAPIStockData(symbol, RAPID_API_KEY);
        } else if (TWELVE_DATA_API_KEY) {
          stockData = await fetchTwelveDataStockData(symbol, TWELVE_DATA_API_KEY);
        } else {
          // Fallback to NSETools API which doesn't require a key
          stockData = await fetchNSEToolsStockData(symbol);
        }

        // Store in cache
        setCachedItem(cacheKey, stockData);

        return new Response(
          JSON.stringify(stockData),
          { 
            headers: { 
              ...corsHeaders,
              "Content-Type": "application/json" 
            } 
          }
        );
      } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        throw error;
      }
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
