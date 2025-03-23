
// Format a number as currency (INR)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
}

// Format large numbers with appropriate suffixes (K, M, B, T)
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `₹${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (value >= 1_000_000_000) {
    return `₹${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `₹${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `₹${(value / 1_000).toFixed(2)}K`;
  }
  return `₹${value.toFixed(2)}`;
}

// Format a percentage value
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Classify PE ratio
export function classifyPE(pe: number): 'high' | 'medium' | 'low' {
  if (pe > 25) return 'high';
  if (pe < 15) return 'low';
  return 'medium';
}

// Get color class based on PE ratio
export function getPEColorClass(pe: number): string {
  const classification = classifyPE(pe);
  if (classification === 'high') return 'text-negative';
  if (classification === 'low') return 'text-positive';
  return 'text-neutral';
}
