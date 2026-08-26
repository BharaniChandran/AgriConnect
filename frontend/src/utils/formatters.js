export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString, locale = 'en') => {
  const date = new Date(dateString);
  // Default to en-IN for general Indian locale DD-MM-YYYY formats, 
  // or pass the i18next resolved language if supported by Intl
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};
