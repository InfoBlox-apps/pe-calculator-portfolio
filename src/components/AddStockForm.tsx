
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Plus, Loader2 } from 'lucide-react';
import { searchStocks } from '@/services/stockService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

interface AddStockFormProps {
  onAddStock: (symbol: string) => Promise<boolean>;
  loading: boolean;
}

export function AddStockForm({ onAddStock, loading }: AddStockFormProps) {
  const [symbol, setSymbol] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSearch = async (value: string) => {
    setSymbol(value);
    
    if (value.length >= 2) {
      setSearching(true);
      try {
        const results = await searchStocks(value);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching stocks:', error);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddStock = async () => {
    if (symbol.trim()) {
      const success = await onAddStock(symbol.trim());
      if (success) {
        setSymbol('');
        setOpen(false);
      }
    }
  };

  const handleSelectStock = async (selected: string) => {
    setSymbol(selected);
    setOpen(false);
    await onAddStock(selected);
    setSymbol('');
  };

  return (
    <Card className="p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between w-full font-normal"
                onClick={() => setOpen(true)}
                data-testid="stock-search-button"
              >
                {symbol ? symbol.toUpperCase() : "Search for a stock..."}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" sideOffset={5} style={{ width: 'calc(var(--popover-trigger-width))', minWidth: '300px' }}>
              <Command className="rounded-lg border shadow-md">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input 
                    placeholder="Type stock name or symbol..." 
                    value={symbol}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex h-11 w-full rounded-md border-none bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    autoFocus
                    data-testid="stock-search-input"
                  />
                </div>
                
                {searching && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
                
                <CommandList>
                  {!searching && searchResults.length === 0 && (
                    <CommandEmpty>No stocks found</CommandEmpty>
                  )}
                  
                  {searchResults.length > 0 && (
                    <CommandGroup heading="Stocks">
                      {searchResults.map((stock) => (
                        <CommandItem
                          key={stock.symbol}
                          value={stock.symbol}
                          onSelect={handleSelectStock}
                          className="flex justify-between"
                          data-testid={`stock-result-${stock.symbol}`}
                        >
                          <div>
                            <span className="font-medium">{stock.symbol}</span>
                            <span className="text-sm text-muted-foreground ml-2">{stock.name}</span>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button 
          type="button" 
          onClick={handleAddStock} 
          disabled={loading || !symbol.trim()}
          className="min-w-24"
          data-testid="add-stock-button"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Stock
        </Button>
      </div>
    </Card>
  );
}
