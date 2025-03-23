
import { Card } from '@/components/ui/card';
import { formatPercentage, getPEColorClass } from '@/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { StockData } from '@/services/stockService';

interface PortfolioSummaryProps {
  stocks: StockData[];
  stats: {
    averagePE: number;
    highestPE: { symbol: string; value: number };
    lowestPE: { symbol: string; value: number };
    totalStocks: number;
  };
}

export function PortfolioSummary({ stocks, stats }: PortfolioSummaryProps) {
  // Prepare data for PE ratio distribution chart
  const getPERatioDistribution = () => {
    const distribution = [
      { name: 'Low (< 15)', value: 0, color: '#34A853' },
      { name: 'Medium (15-25)', value: 0, color: '#6E7C8C' },
      { name: 'High (> 25)', value: 0, color: '#EA4335' },
    ];
    
    stocks.forEach(stock => {
      if (stock.peRatio < 15) {
        distribution[0].value++;
      } else if (stock.peRatio <= 25) {
        distribution[1].value++;
      } else {
        distribution[2].value++;
      }
    });
    
    return distribution.filter(item => item.value > 0);
  };
  
  const chartData = getPERatioDistribution();
  
  if (stocks.length === 0) {
    return null;
  }
  
  return (
    <Card className="p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Portfolio Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Average P/E Ratio</p>
              <p className={`text-2xl font-semibold ${getPEColorClass(stats.averagePE)}`}>
                {stats.averagePE.toFixed(2)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Highest P/E</p>
                <p className="text-base">
                  <span className="font-medium">{stats.highestPE.symbol}</span>
                  {' '}
                  <span className={`${getPEColorClass(stats.highestPE.value)}`}>
                    ({stats.highestPE.value.toFixed(2)})
                  </span>
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Lowest P/E</p>
                <p className="text-base">
                  <span className="font-medium">{stats.lowestPE.symbol}</span>
                  {' '}
                  <span className={`${getPEColorClass(stats.lowestPE.value)}`}>
                    ({stats.lowestPE.value.toFixed(2)})
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Total Stocks</p>
              <p className="text-2xl font-semibold">{stats.totalStocks}</p>
            </div>
          </div>
        </div>
        
        <div className="h-60">
          <p className="text-sm text-muted-foreground mb-2">P/E Ratio Distribution</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${formatPercentage(percent * 100)}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} stocks`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Not enough data to display chart</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
