export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KW', {
    style: 'currency',
    currency: 'KWD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount)
}

export const parseCurrency = (value: string): number => {
  // Remove the currency symbol and any commas
  const cleanValue = value.replace(/[^0-9.-]/g, '')
  return parseFloat(cleanValue)
}

// Alias for backward compatibility
export const formatKWD = formatCurrency
