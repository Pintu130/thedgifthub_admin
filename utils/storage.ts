/**
 * Storage utility for handling localStorage operations
 */

/**
 * Set an item in localStorage
 * @param key - The key under which to store the value
 * @param value - The value to store (will be stringified)
 */
export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    if (typeof window !== 'undefined') {
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
    }
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
};

/**
 * Get an item from localStorage
 * @param key - The key of the item to retrieve
 * @param defaultValue - The default value to return if the item doesn't exist
 * @returns The parsed value or the default value if not found
 */
export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== 'undefined') {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    }
  } catch (error) {
    console.error('Error getting localStorage item:', error);
  }
  return defaultValue;
};

/**
 * Remove an item from localStorage
 * @param key - The key of the item to remove
 */
export const removeLocalStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
};

/**
 * Clear all items from localStorage
 */
export const clearLocalStorage = (): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
