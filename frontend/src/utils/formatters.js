export const formatCurrency = (amount, language = 'en-IN') => {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString, language = 'en-IN') => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};
