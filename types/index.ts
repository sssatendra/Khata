// User Types
export type UserRole = "admin" | "staff";

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shop Types
export interface Shop {
  id: string;
  name: string;
  ownerPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Types
export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  balance: number;
  lastTransactionDate?: Date;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export type TransactionType = "credit" | "debit";

export interface Transaction {
  id: string;
  customerId: string;
  shopId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Risk Assessment
export interface RiskAssessment {
  customerId: string;
  riskLevel: "low" | "medium" | "high";
  daysSinceLastPayment: number;
  outstandingAmount: number;
  lastAssessedAt: Date;
}

// Ledger Entry (for display)
export interface LedgerEntry extends Transaction {
  runningBalance: number;
  customerName: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalOutstanding: number;
  totalCustomers: number;
  highRiskCount: number;
  recentTransactions: Transaction[];
  topDebtors: Customer[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Notification Types
export type NotificationType = "overdue" | "high_balance" | "payment_received";

export interface Notification {
  id: string;
  userId: string;
  customerId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
