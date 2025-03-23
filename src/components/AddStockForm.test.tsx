
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { AddStockForm } from './AddStockForm';
import { searchStocks } from '@/services/stockService';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the searchStocks service
vi.mock('@/services/stockService', () => ({
  searchStocks: vi.fn(),
}));

describe('AddStockForm', () => {
  const mockOnAddStock = vi.fn().mockResolvedValue(true);
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock implementation of searchStocks
    (searchStocks as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.' },
      { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.' },
    ]);
  });

  it('renders the search button correctly', () => {
    render(<AddStockForm onAddStock={mockOnAddStock} loading={false} />);
    
    expect(screen.getByText('Search for a stock...')).toBeInTheDocument();
    expect(screen.getByTestId('stock-search-button')).toBeInTheDocument();
  });

  it('opens the dropdown when clicking the search button', async () => {
    render(<AddStockForm onAddStock={mockOnAddStock} loading={false} />);
    
    fireEvent.click(screen.getByTestId('stock-search-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('stock-search-input')).toBeInTheDocument();
    });
  });

  it('allows typing in the search input and displays results', async () => {
    render(<AddStockForm onAddStock={mockOnAddStock} loading={false} />);
    
    // Open the dropdown
    fireEvent.click(screen.getByTestId('stock-search-button'));
    
    // Get the input element and type in it
    const input = await screen.findByTestId('stock-search-input');
    fireEvent.change(input, { target: { value: 're' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(searchStocks).toHaveBeenCalledWith('re');
    });
    
    // Verify results are displayed
    await waitFor(() => {
      expect(screen.getByTestId('stock-result-RELIANCE')).toBeInTheDocument();
      expect(screen.getByTestId('stock-result-TCS')).toBeInTheDocument();
    });
  });

  it('calls onAddStock when selecting a stock', async () => {
    render(<AddStockForm onAddStock={mockOnAddStock} loading={false} />);
    
    // Open the dropdown
    fireEvent.click(screen.getByTestId('stock-search-button'));
    
    // Get the input element and type in it
    const input = await screen.findByTestId('stock-search-input');
    fireEvent.change(input, { target: { value: 're' } });
    
    // Wait for search results and click on one
    await waitFor(() => {
      const resultItem = screen.getByTestId('stock-result-RELIANCE');
      fireEvent.click(resultItem);
    });
    
    // Verify onAddStock was called with the right symbol
    expect(mockOnAddStock).toHaveBeenCalledWith('RELIANCE');
  });
});
