
import { render, screen, fireEvent } from '../utils/test-utils';
import { StockCard } from './StockCard';

describe('StockCard', () => {
  const mockStock = {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd.',
    currentPrice: 2500.75,
    eps: 100.25,
    peRatio: 24.94,
    high52Week: 2800.00,
    low52Week: 2200.00,
    marketCap: 1680000000000,
    lastUpdated: new Date().toISOString(),
  };
  
  const mockOnRemove = jest.fn();

  it('renders stock details correctly', () => {
    render(<StockCard stock={mockStock} onRemove={mockOnRemove} />);
    
    expect(screen.getByText('RELIANCE')).toBeInTheDocument();
    expect(screen.getByText('Reliance Industries Ltd.')).toBeInTheDocument();
    expect(screen.getByText('24.94')).toBeInTheDocument();
  });

  it('displays PE ratio with correct color based on value', () => {
    render(<StockCard stock={mockStock} onRemove={mockOnRemove} />);
    
    // The medium PE ratio (15-25) should have a neutral color
    const peElement = screen.getByText('24.94');
    expect(peElement).toHaveClass('text-neutral');
    
    // Test with high PE ratio
    const highPEStock = { ...mockStock, peRatio: 30 };
    render(<StockCard stock={highPEStock} onRemove={mockOnRemove} />);
    
    const highPEElement = screen.getByText('30.00');
    expect(highPEElement).toHaveClass('text-negative');
  });

  it('calls onRemove when remove button is clicked', () => {
    render(<StockCard stock={mockStock} onRemove={mockOnRemove} />);
    
    const removeButton = screen.getByRole('button');
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledWith('RELIANCE');
  });
});
