/**
 * hooks/useLocalStorage.js
 *
 * A generic, reusable hook for reading/writing to localStorage
 * with automatic JSON serialization and error recovery.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('theme', 'dark')
 */

import { useCallback, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (valueToStore === undefined || valueToStore === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (err) {
        console.error(`useLocalStorage: Failed to set "${key}"`, err);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (err) {
      console.error(`useLocalStorage: Failed to remove "${key}"`, err);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
