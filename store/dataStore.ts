import { differenceInDays } from "date-fns";
import { create } from "zustand";
import { customerService, transactionService } from "../services/firestore";
import { Customer, DashboardStats, Transaction } from "../types";

interface DataState {
  // Customers
  customers: Customer[];
  selectedCustomer: Customer | null;
  customersLoading: boolean;
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setCustomersLoading: (loading: boolean) => void;
  fetchCustomers: (shopId: string) => Promise<void>;
  addCustomer: (customer: Customer) => void;
  updateCustomerInStore: (customer: Customer) => void;

  // Transactions
  transactions: Transaction[];
  transactionsLoading: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  setTransactionsLoading: (loading: boolean) => void;
  fetchRecentTransactions: (shopId: string) => Promise<void>;
  addTransactionToStore: (transaction: Transaction) => void;

  // Ledger
  ledgerEntries: any[];
  ledgerLoading: boolean;
  setLedgerLoading: (loading: boolean) => void;
  fetchCustomerLedger: (customerId: string) => Promise<void>;

  // Dashboard Stats
  stats: DashboardStats | null;
  calculateStats: (shopId: string) => Promise<void>;
  getRiskLevel: (customer: Customer) => "low" | "medium" | "high";
}

export const useDataStore = create<DataState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  customersLoading: false,
  setCustomers: (customers) => set(() => ({ customers })),
  setSelectedCustomer: (customer) =>
    set(() => ({ selectedCustomer: customer })),
  setCustomersLoading: (loading) => set(() => ({ customersLoading: loading })),

  fetchCustomers: async (shopId: string) => {
    try {
      set(() => ({ customersLoading: true }));
      const customers = await customerService.getCustomersByShop(shopId);
      set(() => ({ customers, customersLoading: false }));
    } catch (error) {
      console.error("Error fetching customers:", error);
      set(() => ({ customersLoading: false }));
      throw error;
    }
  },

  addCustomer: (customer) => {
    const { customers } = get();
    set(() => ({
      customers: [customer, ...customers],
    }));
  },

  updateCustomerInStore: (updatedCustomer) => {
    const { customers } = get();
    set(() => ({
      customers: customers.map((c) =>
        c.id === updatedCustomer.id ? updatedCustomer : c,
      ),
    }));
  },

  transactions: [],
  transactionsLoading: false,
  setTransactions: (transactions) => set(() => ({ transactions })),
  setTransactionsLoading: (loading) =>
    set(() => ({ transactionsLoading: loading })),

  fetchRecentTransactions: async (shopId: string) => {
    try {
      set(() => ({ transactionsLoading: true }));
      const transactions = await transactionService.getTransactionsByShop(
        shopId,
        50,
      );
      set(() => ({ transactions, transactionsLoading: false }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      set(() => ({ transactionsLoading: false }));
      throw error;
    }
  },

  addTransactionToStore: (transaction) => {
    const { transactions } = get();
    set(() => ({
      transactions: [transaction, ...transactions],
    }));
  },

  ledgerEntries: [],
  ledgerLoading: false,
  setLedgerLoading: (loading) => set(() => ({ ledgerLoading: loading })),

  fetchCustomerLedger: async (customerId: string) => {
    try {
      set(() => ({ ledgerLoading: true }));
      const ledgerEntries =
        await transactionService.getCustomerLedger(customerId);
      set(() => ({ ledgerEntries, ledgerLoading: false }));
    } catch (error) {
      console.error("Error fetching ledger:", error);
      set(() => ({ ledgerLoading: false }));
      throw error;
    }
  },

  stats: null,
  calculateStats: async (shopId: string) => {
    try {
      const customers = await customerService.getCustomersByShop(shopId);
      const transactions = await transactionService.getTransactionsByShop(
        shopId,
        100,
      );

      const totalOutstanding = customers.reduce(
        (sum, c) => sum + Math.max(0, c.balance),
        0,
      );
      const highRiskCount = customers.filter(
        (c) => get().getRiskLevel(c) === "high",
      ).length;

      const topDebtors = [...customers]
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);

      set(() => ({
        stats: {
          totalOutstanding,
          totalCustomers: customers.length,
          highRiskCount,
          recentTransactions: transactions.slice(0, 10),
          topDebtors,
        },
      }));
    } catch (error) {
      console.error("Error calculating stats:", error);
      throw error;
    }
  },

  getRiskLevel: (customer: Customer) => {
    const daysSinceLastPayment = customer.lastTransactionDate
      ? differenceInDays(new Date(), customer.lastTransactionDate)
      : 999;

    if (daysSinceLastPayment > 30 || customer.balance > 10000) {
      return "high";
    }
    if (daysSinceLastPayment > 15 || customer.balance > 5000) {
      return "medium";
    }
    return "low";
  },
}));
