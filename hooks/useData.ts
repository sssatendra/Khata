import { useCallback, useEffect, useState } from "react";
import { useDataStore } from "../store/dataStore";
import { Customer } from "../types";
import { searchCustomers } from "../utils/helpers";

/**
 * Hook for searching customers
 */
export const useCustomerSearch = (shopId: string) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const { customers } = useDataStore();

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
      } else {
        const results = searchCustomers(customers, query);
        setSearchResults(results);
      }
    },
    [customers],
  );

  return {
    searchQuery,
    searchResults,
    handleSearch,
    setSearchQuery,
  };
};

/**
 * Hook for risk level calculation
 */
export const useRiskLevel = () => {
  const { getRiskLevel } = useDataStore();
  return { getRiskLevel };
};

/**
 * Hook for loading customer data
 */
export const useCustomerData = (shopId: string) => {
  const { fetchCustomers, customers, customersLoading } = useDataStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCustomers(shopId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load customers",
        );
      }
    };

    loadData();
  }, [shopId, fetchCustomers]);

  return { customers, loading: customersLoading, error };
};

/**
 * Hook for loading transactions
 */
export const useTransactionData = (shopId: string) => {
  const { fetchRecentTransactions, transactions, transactionsLoading } =
    useDataStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchRecentTransactions(shopId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load transactions",
        );
      }
    };

    loadData();
  }, [shopId, fetchRecentTransactions]);

  return { transactions, loading: transactionsLoading, error };
};

/**
 * Hook for loading customer ledger
 */
export const useCustomerLedger = (customerId: string) => {
  const { fetchCustomerLedger, ledgerEntries, ledgerLoading } = useDataStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerId) {
      const loadLedger = async () => {
        try {
          await fetchCustomerLedger(customerId);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to load ledger",
          );
        }
      };

      loadLedger();
    }
  }, [customerId, fetchCustomerLedger]);

  return { ledgerEntries, loading: ledgerLoading, error };
};

/**
 * Hook for dashboard statistics
 */
export const useDashboardStats = (shopId: string) => {
  const { stats, calculateStats } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        await calculateStats(shopId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [shopId, calculateStats]);

  return { stats, loading, error };
};
