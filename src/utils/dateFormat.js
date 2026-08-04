/**
 * Reusable Date Formatting Utility for Family Finance
 * Converts ISO date strings (YYYY-MM-DD or ISO timestamp) into DD/MM/YYYY format.
 * Examples:
 *   "2026-08-04" -> "04/08/2026"
 *   "2026-12-25" -> "25/12/2026"
 *   "2026-08-04T12:34:56.789Z" -> "04/08/2026"
 */

export function formatDisplayDate(dateVal) {
  if (!dateVal) return '';

  // If already in DD/MM/YYYY format, return directly
  if (typeof dateVal === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateVal.trim())) {
    return dateVal.trim();
  }

  // Handle YYYY-MM-DD simple date string directly without timezone offset shifts
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    const [yyyy, mm, dd] = dateVal.trim().split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  try {
    const dateObj = new Date(dateVal);
    if (isNaN(dateObj.getTime())) return String(dateVal);

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (e) {
    return String(dateVal);
  }
}
