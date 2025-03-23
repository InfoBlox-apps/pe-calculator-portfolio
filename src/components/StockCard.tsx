
import { StockData } from '@/services/stockService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatLargeNumber } from '@/utils/formatters';
import { motion } from 'framer-motion';

interface StockCardProps {
  stock: StockData;
  onRemove: (symbol: string) => void;
}

export function StockCard({ stock, onRemove }: StockCardProps) {
  const isPeHigh = stock.peRatio > 25;
  const isPeLow = stock.peRatio < 15;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-lg tracking-tight">{stock.symbol}</h3>
            <p className="text-muted-foreground text-sm truncate max-w-[150px] sm:max-w-[250px]">
              {stock.companyName}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onRemove(stock.symbol)}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
        
        <div className="p-4 grid gap-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Current Price</span>
            <span className="number-font text-foreground font-medium">
              {formatCurrency(stock.currentPrice)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">EPS</span>
            <span className="number-font text-foreground font-medium">
              {formatCurrency(stock.eps)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">P/E Ratio</span>
            <div className="flex items-center gap-1">
              {isPeHigh && <TrendingUp className="h-4 w-4 text-negative" />}
              {isPeLow && <TrendingDown className="h-4 w-4 text-positive" />}
              <span className={`number-font font-medium ${
                isPeHigh ? 'text-negative' : 
                isPeLow ? 'text-positive' : 'text-neutral'
              }`}>
                {stock.peRatio.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Market Cap</span>
            <span className="number-font text-foreground font-medium">
              {formatLargeNumber(stock.marketCap)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">52W Range</span>
            <span className="number-font text-foreground text-sm">
              {formatCurrency(stock.low52Week)} - {formatCurrency(stock.high52Week)}
            </span>
          </div>
        </div>
        
        <div className="px-4 pb-4 pt-2">
          <div className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(stock.lastUpdated).toLocaleString()}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
