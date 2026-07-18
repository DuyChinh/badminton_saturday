/**
 * Format number as VND currency
 * 50000 → "50.000đ"
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

/**
 * Format date string
 * "2024-07-15 10:20:30" → "15/07/2024 10:20"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};
