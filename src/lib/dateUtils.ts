// Date utility functions to handle timezone issues consistently

/**
 * Format a date string for display, ensuring it shows the correct local date
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  // If it's already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Parse the date and format it without timezone conversion
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
};

/**
 * Format a date for form inputs (ensures YYYY-MM-DD format)
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  // If it's already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Parse and format
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA');
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toLocaleDateString('en-CA');
};

/**
 * Format date for display in tables and lists
 */
export const formatDateForTable = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
