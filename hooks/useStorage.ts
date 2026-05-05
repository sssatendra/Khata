import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

/**
 * Hook for persisting state to AsyncStorage
 */
export const useAsyncStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue) {
          setValue(JSON.parse(storedValue));
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Save to storage when value changes
  const updateValue = async (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  return [value, updateValue, loading] as const;
};

/**
 * Hook for managing offline cache
 */
export const useOfflineCache = () => {
  const [isCached, setIsCached] = useState(false);

  const saveToCache = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(data));
      setIsCached(true);
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  const getFromCache = async (key: string) => {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting from cache:", error);
      return null;
    }
  };

  const clearCache = async (key?: string) => {
    try {
      if (key) {
        await AsyncStorage.removeItem(`cache_${key}`);
      } else {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter((k) => k.startsWith("cache_"));
        await AsyncStorage.multiRemove(cacheKeys);
      }
      setIsCached(false);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  return { saveToCache, getFromCache, clearCache, isCached };
};
