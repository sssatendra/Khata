import AsyncStorage from "@react-native-async-storage/async-storage";
import { Customer, Transaction, DashboardStats, LedgerEntry } from "../types";

/**
 * Mock Database Service for Development
 * Uses AsyncStorage to persist data locally without needing Firestore/Java.
 */

const CUSTOMERS_KEY = "mock_customers";
const TRANSACTIONS_KEY = "mock_transactions";

export const mockDb = {
  // ============= Helpers =============
  async getCustomers(): Promise<Customer[]> {
    const data = await AsyncStorage.getItem(CUSTOMERS_KEY);
    if (!data) return [];
    const customers = JSON.parse(data);
    return customers.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      lastTransactionDate: c.lastTransactionDate ? new Date(c.lastTransactionDate) : undefined,
    }));
  },

  async saveCustomers(customers: Customer[]) {
    await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  async getTransactions(): Promise<Transaction[]> {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    if (!data) return [];
    const transactions = JSON.parse(data);
    return transactions.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  },

  async saveTransactions(transactions: Transaction[]) {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  },

  // ============= Customer Service =============
  async createCustomer(data: Omit<Customer, "id">): Promise<string> {
    const customers = await this.getCustomers();
    const newCustomer: Customer = {
      ...data,
      id: "mock_" + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    customers.push(newCustomer);
    await this.saveCustomers(customers);
    return newCustomer.id;
  },

  async getCustomersByShop(shopId: string): Promise<Customer[]> {
    const customers = await this.getCustomers();
    return customers.filter(c => c.shopId === shopId && c.status === "active");
  },

  async getCustomer(customerId: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find(c => c.id === customerId) || null;
  },

  async updateCustomer(customerId: string, data: Partial<Customer>) {
    const customers = await this.getCustomers();
    const index = customers.findIndex(c => c.id === customerId);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...data, updatedAt: new Date() };
      await this.saveCustomers(customers);
    }
  },

  // ============= Transaction Service =============
  async createTransaction(data: any): Promise<string> {
    const transactions = await this.getTransactions();
    const newTxn: Transaction = {
      ...data,
      id: "txn_" + Date.now(),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date(),
    };
    transactions.push(newTxn);
    await this.saveTransactions(transactions);

    // Update customer balance
    const customer = await this.getCustomer(data.customerId);
    if (customer) {
      const newBalance = data.type === "credit" 
        ? customer.balance + data.amount 
        : customer.balance - data.amount;
      await this.updateCustomer(data.customerId, { 
        balance: newBalance,
        lastTransactionDate: new Date() 
      });
    }

    return newTxn.id;
  },

  async getTransactionsByShop(shopId: string): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions
      .filter(t => t.shopId === shopId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getTransactionsByCustomer(customerId: string): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions
      .filter(t => t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getCustomerLedger(customerId: string): Promise<LedgerEntry[]> {
    const transactions = await this.getTransactionsByCustomer(customerId);
    const customer = await this.getCustomer(customerId);
    if (!customer) return [];

    let runningBalance = 0;
    return transactions
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(t => {
        if (t.type === "credit") runningBalance += t.amount;
        else runningBalance -= t.amount;
        return { ...t, runningBalance, customerName: customer.name };
      })
      .reverse();
  },

  // ============= Dashboard Stats =============
  async getDashboardStats(shopId: string): Promise<DashboardStats> {
    const customers = await this.getCustomersByShop(shopId);
    const transactions = await this.getTransactionsByShop(shopId);
    
    return {
      totalOutstanding: customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0),
      totalCustomers: customers.length,
      highRiskCount: customers.filter(c => c.balance > 5000).length,
      recentTransactions: transactions.slice(0, 10),
      topDebtors: customers.sort((a, b) => b.balance - a.balance).slice(0, 5),
    };
  },
  
  // ============= Support =============
  async submitFeedback(data: any): Promise<void> {
    const feedbackData = await AsyncStorage.getItem("mock_feedback");
    const feedback = feedbackData ? JSON.parse(feedbackData) : [];
    feedback.push({
      ...data,
      id: "feedback_" + Date.now(),
      createdAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem("mock_feedback", JSON.stringify(feedback));
  },
};
