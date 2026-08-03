/**
 * Formats a raw number or string using the Indian Numbering System (en-IN)
 * Examples:
 * 1000 -> 1,000
 * 10000 -> 10,000
 * 100000 -> 1,00,000
 * 1000000 -> 10,00,000
 * 10000000 -> 1,00,00,000
 * 12500.50 -> 12,500.50
 */
export function formatIndianNumber(value) {
  if (value === undefined || value === null || value === '') return '';

  const str = String(value).replace(/[^0-9.]/g, '');
  if (!str) return '';

  const parts = str.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  if (!integerPart) return '0' + decimalPart;

  let lastThree = integerPart.slice(-3);
  let otherNumbers = integerPart.slice(0, -3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return formattedInt + decimalPart;
}

export function parseRawNumericValue(formattedVal) {
  if (formattedVal === undefined || formattedVal === null || formattedVal === '') return 0;
  const clean = String(formattedVal).replace(/,/g, '');
  return parseFloat(clean) || 0;
}
