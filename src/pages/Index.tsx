
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Info } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { AddStockForm } from '@/components/AddStockForm';
import { StockCard } from '@/components/StockCard';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { AnimatePresence, motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StockDataTest } from '@/components/StockDataTest';

const Index = () => {
  const { 
    portfolio, 
    loading, 
    refreshing, 
    addStock, 
    removeStock, 
    refreshPortfolio,
    getPortfolioStats 
  } = usePortfolio();
  
  const [mounted, setMounted] = useState(false);
  const [showTest, setShowTest] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  const portfolioStats = getPortfolioStats();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <header className="py-8 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                NSE P/E Calculator
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">
                  Track and analyze P/E ratios for your NSE India portfolio
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs space-y-2">
                        <p>Stock data is fetched from NSE India using our API.</p>
                        <p>Data is updated once daily (EOD values).</p>
                        <p>HDFC Bank's actual P/E is ~19.5 as per screener.in</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {portfolio.stocks.length > 0 && (
                <Button 
                  onClick={refreshPortfolio} 
                  disabled={refreshing}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
              )}
              
              <Button 
                variant="secondary"
                onClick={() => setShowTest(!showTest)}
              >
                {showTest ? 'Hide Test' : 'Test Data'}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {showTest && <StockDataTest />}
          
          <AddStockForm onAddStock={addStock} loading={loading} />
          
          {portfolio.stocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PortfolioSummary 
                stocks={portfolio.stocks} 
                stats={portfolioStats} 
              />
            </motion.div>
          )}
          
          <div>
            {portfolio.stocks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {portfolio.stocks.map(stock => (
                    <StockCard 
                      key={stock.symbol} 
                      stock={stock} 
                      onRemove={removeStock} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-lg bg-white/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-medium mb-2">Your portfolio is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding stocks to track their P/E ratios
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            NSE P/E Calculator — Using real NSE India stock data updated daily.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
