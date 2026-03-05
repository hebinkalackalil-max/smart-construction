/**
 * Format a date as dd-mm-yyyy for display across the project.
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date (dd-mm-yyyy) or '-' if invalid
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
