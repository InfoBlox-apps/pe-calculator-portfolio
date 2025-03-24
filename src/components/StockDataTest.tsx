
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchStockData } from '@/services/stockService';
import { toast } from 'sonner';

export function StockDataTest() {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('NESTLEIND');
  
  const testStockData = async () => {
    setLoading(true);
    try {
      const data = await fetchStockData(symbol);
      setStockData(data);
      
      // Check if 52-week data matches what we expect for NESTLEIND
      if (symbol === 'NESTLEIND') {
        const expectedHigh = 2778.00;
        const expectedLow = 2110.00;
        
        if (data && Math.abs(data.high52Week - expectedHigh) > 0.01) {
          toast.error(`52-week high incorrect. Expected: ${expectedHigh}, Got: ${data.high52Week}`);
        } else {
          toast.success('52-week high data is correct!');
        }
        
        if (data && Math.abs(data.low52Week - expectedLow) > 0.01) {
          toast.error(`52-week low incorrect. Expected: ${expectedLow}, Got: ${data.low52Week}`);
        } else {
          toast.success('52-week low data is correct!');
        }
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Stock Data Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="px-3 py-2 border rounded flex-1"
            placeholder="Enter stock symbol"
          />
          <Button 
            onClick={testStockData} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Test Data'}
          </Button>
        </div>
        
        {stockData && (
          <div className="border rounded p-4 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold mb-2">{stockData.symbol} - {stockData.companyName}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Current Price:</div>
              <div className="font-medium">{stockData.currentPrice.toFixed(2)}</div>
              
              <div>EPS:</div>
              <div className="font-medium">{stockData.eps.toFixed(2)}</div>
              
              <div>P/E Ratio:</div>
              <div className="font-medium">{stockData.peRatio.toFixed(2)}</div>
              
              <div>52-Week High:</div>
              <div className="font-medium">{stockData.high52Week.toFixed(2)}</div>
              
              <div>52-Week Low:</div>
              <div className="font-medium">{stockData.low52Week.toFixed(2)}</div>
              
              <div>Market Cap:</div>
              <div className="font-medium">{stockData.marketCap.toLocaleString()}</div>
              
              <div>Last Updated:</div>
              <div className="font-medium">{new Date(stockData.lastUpdated).toLocaleString()}</div>
            </div>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>This component tests dynamic data fetching from the NSE India stock API.</p>
          <p>For NESTLEIND, it verifies the 52-week high (₹2,778) and low (₹2,110) values match what's shown on screener.in.</p>
        </div>
      </CardContent>
    </Card>
  );
}
